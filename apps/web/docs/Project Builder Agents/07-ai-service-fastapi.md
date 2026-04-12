# AGENT 07 — Service IA FastAPI Python (services/ai)
> Mission : Implémenter le service IA complet — STT, LLM, TTS, RAG, Function Calling.
> **Travail dans `services/ai/`**

---

## Contexte

Le service IA est un service Python indépendant. Il :
1. Consomme la queue RabbitMQ `ai.tasks` (messages envoyés par NestJS)
2. Exécute le pipeline : STT (si audio) → RAG → LLM → TTS (si vocal activé) → évaluation HITL
3. Publie le résultat sur `ai.results`
4. Expose une API HTTP (FastAPI) pour le simulateur du dashboard

**Ce service ne touche pas à la DB directement** — il appelle NestJS via HTTP pour les données e-commerce, ou query Supabase directement pour les produits/commandes du tenant.

---

## Structure des fichiers

```
services/ai/
├── main.py                  ← FastAPI app + startup consumer RabbitMQ
├── config.py                ← Variables env + config par tenant
├── pipeline/
│   ├── __init__.py
│   ├── stt.py               ← Faster-Whisper
│   ├── llm_router.py        ← GPT-4o → Claude → Llama
│   ├── tts.py               ← ElevenLabs / XTTS → FFmpeg → .ogg
│   └── rag.py               ← Qdrant embeddings
├── functions/
│   ├── __init__.py
│   ├── check_stock.py
│   ├── get_order_status.py
│   ├── suggest_alternative.py
│   └── transfer_to_human.py
├── models/
│   └── schemas.py           ← Pydantic models
├── utils/
│   ├── r2.py                ← Upload/download Cloudflare R2
│   └── redis_client.py      ← Contexte conversation
├── requirements.txt
└── Dockerfile
```

---

## `models/schemas.py`

```python
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AITask(BaseModel):
    tenant_id: str
    conversation_id: str
    message_id: str
    text_message: Optional[str] = None
    audio_url: Optional[str] = None  # R2 URL de la voice note

class FunctionCall(BaseModel):
    name: str
    arguments: Dict[str, Any]
    result: Any

class AIResult(BaseModel):
    tenant_id: str
    conversation_id: str
    message_id: str
    stt_text: Optional[str] = None
    llm_response: Optional[str] = None
    tts_url: Optional[str] = None
    function_calls: List[FunctionCall] = []
    confidence_score: float = 1.0
    hitl_triggered: bool = False
    hitl_reason: Optional[str] = None
    model_used: str = "gpt-4o"
    latency_ms: int = 0

class TenantAIConfig(BaseModel):
    tenant_id: str
    voice_enabled: bool = True
    voice_id: str = "elevenlabs_default"
    language: str = "fr"  # fr | ar | darija
    hitl_threshold: float = 0.70
    safety_mode: bool = False
    system_prompt: Optional[str] = None
    hitl_keywords: List[str] = ["remboursement", "arnaque", "problème", "avocat"]
```

---

## `pipeline/stt.py` — Speech-to-Text

```python
import io
from faster_whisper import WhisperModel

# Charger le modèle une seule fois au démarrage (GPU si disponible)
# Modèle : "large-v3" pour qualité maximale Darija
_model = None

def get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            "large-v3",
            device="cuda",      # "cpu" si pas de GPU
            compute_type="float16"
        )
    return _model

async def transcribe(audio_bytes: bytes, language_hint: str = None) -> dict:
    """
    Transcrit un audio .ogg en texte.
    Retourne : { text, language, segments }
    Optimisé pour Darija/Arabe/Français.
    """
    model = get_model()
    audio_io = io.BytesIO(audio_bytes)

    # Faster-Whisper détecte automatiquement la langue
    segments, info = model.transcribe(
        audio_io,
        language=language_hint,  # None = auto-detect
        task="transcribe",
        vad_filter=True,         # Filtrage silence
        beam_size=5,
    )

    text = " ".join([seg.text for seg in segments])
    return {
        "text": text.strip(),
        "language": info.language,
        "language_probability": info.language_probability,
    }
```

---

## `pipeline/llm_router.py` — LLM avec Function Calling

```python
import openai
import anthropic
import json
import time
from typing import Tuple, List

# Définition des tools pour le LLM
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_stock",
            "description": "Vérifier le stock disponible d'un produit. Utiliser quand le client demande si un produit est disponible.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "Nom ou description du produit recherché"
                    }
                },
                "required": ["product_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_order_status",
            "description": "Récupérer le statut d'une commande client.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string", "description": "ID de la commande"}
                },
                "required": ["order_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "suggest_alternative",
            "description": "Proposer des produits alternatifs quand un produit est en rupture de stock.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string"},
                    "budget": {"type": "number", "description": "Budget max du client (optionnel)"}
                },
                "required": ["product_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "transfer_to_human",
            "description": "Transférer la conversation à un agent humain. Utiliser quand la demande est trop complexe, quand le client est mécontent, ou quand il y a une réclamation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {
                        "type": "string",
                        "description": "Raison du transfert"
                    }
                },
                "required": ["reason"]
            }
        }
    }
]

async def call_llm(
    messages: list,
    system_prompt: str,
    tenant_id: str,
    plan: str = "pro"
) -> Tuple[str, List[dict], float, str]:
    """
    Appelle le LLM approprié selon le plan du tenant.
    Retourne : (response_text, function_calls, confidence_score, model_used)
    """
    # LLM Router : GPT-4o par défaut, Claude si quota GPT dépassé, Llama pour plans trial
    model_used = "gpt-4o"

    try:
        client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                *messages
            ],
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.7,
        )
    except openai.RateLimitError:
        # Fallback Claude
        model_used = "claude-3-5-sonnet"
        response = await call_claude(messages, system_prompt)

    message = response.choices[0].message
    function_calls = []
    response_text = message.content or ""

    # Exécuter les function calls
    if message.tool_calls:
        for tool_call in message.tool_calls:
            fn_name = tool_call.function.name
            fn_args = json.loads(tool_call.function.arguments)
            result = await execute_function(fn_name, fn_args, tenant_id)
            function_calls.append({"name": fn_name, "arguments": fn_args, "result": result})

        # Si transfer_to_human appelé, retourner directement
        for fc in function_calls:
            if fc["name"] == "transfer_to_human":
                return "", function_calls, 0.0, model_used

        # Deuxième appel LLM avec les résultats des functions
        messages_with_results = messages + [
            {"role": "assistant", "content": None, "tool_calls": message.tool_calls},
            *[{"role": "tool", "tool_call_id": tc.id, "content": json.dumps(fc["result"])}
              for tc, fc in zip(message.tool_calls, function_calls)]
        ]
        second_response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": system_prompt}, *messages_with_results],
            temperature=0.7,
        )
        response_text = second_response.choices[0].message.content

    # Calculer le confidence score (heuristique)
    confidence = calculate_confidence(response_text, function_calls)

    return response_text, function_calls, confidence, model_used


def calculate_confidence(response: str, function_calls: list) -> float:
    """
    Score de confiance basé sur :
    - Longueur de réponse (trop courte = incertain)
    - Function calls réussis (stock trouvé = confiant)
    - Présence de mots d'incertitude
    """
    score = 0.85  # Base

    if len(response) < 20:
        score -= 0.3  # Réponse trop courte

    uncertainty_words = ["je ne sais pas", "je ne suis pas sûr", "peut-être", "probablement"]
    if any(w in response.lower() for w in uncertainty_words):
        score -= 0.2

    if any(fc["name"] == "check_stock" and fc["result"].get("stock", 0) > 0 for fc in function_calls):
        score += 0.1  # Produit trouvé en stock = plus confiant

    return max(0.0, min(1.0, score))
```

---

## `pipeline/tts.py` — Text-to-Speech

```python
import io
import subprocess
import aiohttp
from pathlib import Path

async def generate_audio(text: str, voice_id: str, language: str) -> bytes:
    """
    Génère un fichier .ogg (libopus) depuis du texte.
    1. ElevenLabs API → WAV/MP3
    2. FFmpeg → .ogg libopus (compatible WhatsApp)
    Retourne les bytes du fichier .ogg
    """
    # 1. Générer audio via ElevenLabs
    raw_audio = await elevenlabs_tts(text, voice_id)

    # 2. Convertir en .ogg libopus via FFmpeg
    ogg_bytes = await convert_to_ogg(raw_audio)

    return ogg_bytes


async def elevenlabs_tts(text: str, voice_id: str) -> bytes:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    async with aiohttp.ClientSession() as session:
        async with session.post(
            url,
            json={
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}
            },
            headers={"xi-api-key": ELEVENLABS_API_KEY}
        ) as resp:
            return await resp.read()


async def convert_to_ogg(audio_bytes: bytes) -> bytes:
    """
    FFmpeg : MP3/WAV → OGG Opus (format WhatsApp)
    WhatsApp accepte : audio/ogg avec codec opus
    """
    process = await asyncio.create_subprocess_exec(
        "ffmpeg",
        "-i", "pipe:0",          # Input depuis stdin
        "-c:a", "libopus",        # Codec Opus
        "-b:a", "32k",            # Bitrate optimal WhatsApp
        "-vbr", "on",
        "-compression_level", "10",
        "-f", "ogg",              # Format OGG
        "pipe:1",                  # Output vers stdout
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate(input=audio_bytes)
    if process.returncode != 0:
        raise RuntimeError(f"FFmpeg error: {stderr.decode()}")
    return stdout
```

---

## `main.py` — Pipeline Principal

```python
import asyncio
import aio_pika
import json
import time
from fastapi import FastAPI, UploadFile, File
from .models.schemas import AITask, AIResult, TenantAIConfig
from .pipeline.stt import transcribe
from .pipeline.llm_router import call_llm
from .pipeline.tts import generate_audio
from .pipeline.rag import get_rag_context
from .utils.r2 import download_from_r2, upload_to_r2
from .utils.redis_client import get_conversation_context, save_conversation_context
from .config import RABBITMQ_URL, get_tenant_config, get_system_prompt

app = FastAPI(title="pretalkme AI Service")


async def process_ai_task(task_data: dict):
    """Pipeline principal — appelé pour chaque message de la queue ai.tasks"""
    start_time = time.time()
    task = AITask(**task_data)

    try:
        # 1. Config du tenant
        config: TenantAIConfig = await get_tenant_config(task.tenant_id)

        # 2. STT si voice note
        text_input = task.text_message
        stt_text = None
        if task.audio_url:
            audio_bytes = await download_from_r2(task.audio_url)
            stt_result = await transcribe(audio_bytes)
            text_input = stt_result["text"]
            stt_text = text_input
            print(f"STT result: '{text_input}' (lang: {stt_result['language']})")

        if not text_input:
            return  # Message vide, ignorer

        # 3. Vérifier keywords HITL avant même d'appeler le LLM
        for keyword in config.hitl_keywords:
            if keyword.lower() in text_input.lower():
                await publish_hitl(task, f"Mot-clé sensible détecté : '{keyword}'")
                return

        # 4. Contexte conversation (Redis : 10 derniers messages)
        context = await get_conversation_context(task.conversation_id, limit=10)

        # 5. RAG : embeddings produits et FAQ du tenant
        rag_chunks = await get_rag_context(task.tenant_id, text_input, top_k=5)

        # 6. Construire les messages pour le LLM
        system_prompt = await get_system_prompt(task.tenant_id, rag_chunks)
        messages = [*context, {"role": "user", "content": text_input}]

        # 7. Appel LLM
        response_text, function_calls, confidence, model_used = await call_llm(
            messages, system_prompt, task.tenant_id
        )

        # 8. Transfer forcé si LLM a appelé transfer_to_human
        if any(fc["name"] == "transfer_to_human" for fc in function_calls):
            reason = next(fc["arguments"]["reason"] for fc in function_calls if fc["name"] == "transfer_to_human")
            await publish_hitl(task, reason)
            return

        # 9. Vérifier score de confiance
        if confidence < config.hitl_threshold:
            await publish_hitl(task, f"Score de confiance trop faible ({confidence:.0%})")
            return

        # 10. TTS si mode vocal activé
        tts_url = None
        if config.voice_enabled and response_text:
            ogg_bytes = await generate_audio(response_text, config.voice_id, config.language)
            tts_url = await upload_to_r2(ogg_bytes, f"tts/{task.tenant_id}/{task.conversation_id}_{int(time.time())}.ogg")

        # 11. Sauvegarder contexte dans Redis
        await save_conversation_context(task.conversation_id, [
            *context,
            {"role": "user", "content": text_input},
            {"role": "assistant", "content": response_text},
        ])

        # 12. Publier résultat
        latency = int((time.time() - start_time) * 1000)
        result = AIResult(
            tenant_id=task.tenant_id,
            conversation_id=task.conversation_id,
            message_id=task.message_id,
            stt_text=stt_text,
            llm_response=response_text,
            tts_url=tts_url,
            function_calls=function_calls,
            confidence_score=confidence,
            hitl_triggered=False,
            model_used=model_used,
            latency_ms=latency,
        )
        await publish_result(result)

    except Exception as e:
        print(f"ERROR processing task {task.conversation_id}: {e}")
        # Publier sur DLQ
        await publish_dlq(task, str(e))


async def publish_hitl(task: AITask, reason: str):
    result = AIResult(
        tenant_id=task.tenant_id,
        conversation_id=task.conversation_id,
        message_id=task.message_id,
        hitl_triggered=True,
        hitl_reason=reason,
        confidence_score=0.0,
    )
    await publish_result(result)


# ═══════════════════════════════════
# RabbitMQ Consumer
# ═══════════════════════════════════

async def start_rabbitmq_consumer():
    connection = await aio_pika.connect_robust(RABBITMQ_URL)
    channel = await connection.channel()
    await channel.set_qos(prefetch_count=5)  # 5 tâches en parallèle max

    queue = await channel.declare_queue("ai.tasks", durable=True)

    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            async with message.process():
                task_data = json.loads(message.body)
                await process_ai_task(task_data)


# ═══════════════════════════════════
# HTTP API (Simulateur dashboard)
# ═══════════════════════════════════

@app.post("/simulate")
async def simulate(
    tenant_id: str,
    text: str = None,
    audio: UploadFile = File(None)
):
    """Endpoint appelé par le dashboard pour tester l'agent IA"""
    audio_url = None
    if audio:
        audio_bytes = await audio.read()
        audio_url = await upload_to_r2(audio_bytes, f"sim/{tenant_id}/test_{int(time.time())}.ogg")

    task = AITask(
        tenant_id=tenant_id,
        conversation_id=f"sim_{tenant_id}",
        message_id="sim",
        text_message=text,
        audio_url=audio_url,
    )

    result = []  # Collecter le résultat en mode simulation (pas publier sur queue)
    # ... adapter process_ai_task pour retourner au lieu de publier


@app.get("/health")
async def health():
    return {"status": "ok", "service": "pretalkme-ai"}


@app.on_event("startup")
async def startup():
    asyncio.create_task(start_rabbitmq_consumer())
```

---

## `requirements.txt`

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
pydantic==2.0.0
aio-pika==9.4.0
aiohttp==3.9.0
openai==1.40.0
anthropic==0.34.0
faster-whisper==1.0.3
qdrant-client==1.10.0
redis==5.0.0
boto3==1.35.0          # Cloudflare R2 (S3-compatible)
supabase==2.0.0
```

---

## `Dockerfile`

```dockerfile
FROM python:3.11-slim

# FFmpeg nécessaire pour la conversion audio
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# CUDA support (décommenter si GPU disponible sur le serveur)
# FROM nvidia/cuda:12.1-runtime-ubuntu22.04

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

---

## Résultat attendu

- Le service démarre et se connecte à RabbitMQ
- Envoyer un message sur `ai.tasks` → le service le traite et publie sur `ai.results`
- STT : une voice note .ogg transcrite correctement (tester en Français d'abord)
- LLM : réponse cohérente avec les produits du tenant
- TTS : un fichier .ogg généré et uploadé sur R2
- HITL : déclenché correctement quand mot-clé ou score < seuil

## Vérification

```bash
cd services/ai && uvicorn main:app --reload --port 8000

# Tester le simulateur HTTP :
curl -X POST http://localhost:8000/simulate \
  -F "tenant_id=test-tenant-123" \
  -F "text=Salam, bghit nchri le sac rouge, wach kayn?"

# Réponse attendue :
# {
#   "stt_text": null,
#   "llm_response": "Bonsoir ! Le sac rouge est disponible en stock...",
#   "tts_url": "https://media.pretalk.me/tts/...",
#   "confidence_score": 0.87,
#   "hitl_triggered": false
# }
```

---

## ⚠️ Actions à faire par le propriétaire du projet (toi)

Une fois le service IA déployé par l'agent, voici les étapes **externes** que tu dois réaliser :

### OpenAI
```
□ 1. Aller sur platform.openai.com → API Keys → Créer une clé
□ 2. Définir une limite de budget mensuel (recommandé : 100$/mois pour démarrer)
□ 3. Renseigner OPENAI_API_KEY dans les variables d'env du service IA (Coolify)
```

### Anthropic (Claude — fallback LLM)
```
□ 1. Aller sur console.anthropic.com → API Keys → Créer une clé
□ 2. Renseigner ANTHROPIC_API_KEY dans les variables d'env
```

### ElevenLabs (TTS voix)
```
□ 1. Créer un compte sur elevenlabs.io
□ 2. API Keys → Créer une clé → ELEVENLABS_API_KEY
□ 3. Dans le dashboard ElevenLabs, noter les Voice IDs disponibles
     - Voix recommandées pour Darija/FR : tester "Rachel", "Adam", ou cloner une voix custom
□ 4. Renseigner les Voice IDs dans la config tenant (table tenants.ai_voice_id)
□ 5. Surveiller les crédits (plan Starter : 30k caractères/mois)
```

### FFmpeg sur le serveur
```
□ Le Dockerfile installe FFmpeg automatiquement.
□ Vérifier après déploiement :
  docker exec pretalkme-ai ffmpeg -version
  # → Doit afficher la version FFmpeg avec libopus
```

### Faster-Whisper (modèle STT)
```
□ Le modèle "large-v3" se télécharge automatiquement au premier démarrage (~3GB).
□ Prévoir 5-10 min de téléchargement au premier boot.
□ Si GPU disponible sur le VPS :
   - Installer les drivers CUDA (NVIDIA)
   - Modifier le Dockerfile pour utiliser l'image CUDA
   - Changer device="cuda" dans stt.py (déjà configuré par défaut)
□ Si pas de GPU (CPU only) :
   - Changer device="cpu" dans stt.py
   - Le STT sera plus lent (~5-10s au lieu de 1-2s)
   - Envisager d'utiliser l'API Whisper OpenAI à la place (plus lent mais pas de GPU nécessaire)
```

### Qdrant (Vector DB pour RAG)
```
□ Qdrant tourne sur Coolify (voir prompt 09).
□ Après démarrage, créer les collections nécessaires :
  curl -X PUT http://localhost:6333/collections/products \
    -H 'Content-Type: application/json' \
    -d '{"vectors": {"size": 1536, "distance": "Cosine"}}'
□ Les embeddings seront générés automatiquement lors de la sync e-commerce (Agent 06).
```

### Documentation SYNC-GUIDE
```
□ Mettre à jour docs/SYNC-GUIDE.md avec :
  - Format exact de AITask (queue ai.tasks)
  - Format exact de AIResult (queue ai.results)
  - Voice IDs ElevenLabs configurés
  - Langues supportées par le STT
```
