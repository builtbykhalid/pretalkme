import asyncio
import os
import json
import time
import aio_pika
from supabase import create_client
from fastapi import FastAPI, BackgroundTasks
from dotenv import load_dotenv

load_dotenv()

from models.schemas import AITask, AIResult
from pipeline.stt import transcribe_from_url
from pipeline.llm_router import call_llm
from pipeline.tts import generate_and_upload_tts
from pipeline.vision import analyze_image, extract_pdf_text
from utils.r2 import download_from_r2

app = FastAPI(title="Pretalk Hub AI Service")

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost/")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

supabase_client = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def save_message_analysis(message_id: str | None, field_name: str, value: str):
    if not supabase_client or not message_id or not value:
        return

    try:
        supabase_client.table("messages").update({field_name: value}).eq("id", message_id).execute()
    except Exception as exc:
        print(f"Failed to persist {field_name} for message {message_id}: {exc}")

async def process_ai_task(task_data: dict, channel: aio_pika.Channel):
    """Main AI Pipeline Logic."""
    start_time = time.time()
    try:
        task = AITask(**task_data)
    except Exception as e:
        print(f"Invalid task data: {e}")
        return
    
    print(f"Processing Task: {task.conversation_id}")
    
    try:
        # 1. STT (If audio)
        text_input = task.text_message
        stt_text = None
        if task.audio_url:
            stt_result = await transcribe_from_url(task.audio_url)
            text_input = stt_result["text"]
            stt_text = text_input

        # 1.b Vision (If image)
        image_context = ""
        if task.image_url and OPENAI_API_KEY:
            image_bytes = await download_from_r2(task.image_url)
            image_context = await analyze_image(
                image_bytes,
                task.image_mime_type or "image/jpeg",
                text_input or "",
                OPENAI_API_KEY,
            )
            if not text_input:
                text_input = "[Image envoyee par le client]"
            save_message_analysis(task.message_id, "image_description", image_context)

        # 1.c PDF text extraction (If PDF)
        pdf_context = ""
        if task.pdf_url:
            pdf_bytes = await download_from_r2(task.pdf_url)
            pdf_context = await extract_pdf_text(pdf_bytes)
            if not text_input:
                text_input = f"[Document PDF envoye: {task.pdf_filename or 'document.pdf'}]"
            save_message_analysis(task.message_id, "pdf_extracted_text", pdf_context)

        if not text_input:
            print("Empty input, skipping.")
            return

        # 2. LLM Call
        # TODO: Fetch real system prompt and context from Supabase/Redis
        system_prompt = "Tu es un assistant commercial pour une boutique WhatsApp. Reponds poliment et aide le client."
        if image_context:
            system_prompt += f"\n\n[CONTENU IMAGE PARTAGEE PAR LE CLIENT]\n{image_context}"
        if pdf_context:
            system_prompt += f"\n\n[CONTENU DOCUMENT PDF PARTAGE]\n{pdf_context[:2000]}"
        messages = [{"role": "user", "content": text_input}]
        
        response_text, function_calls, confidence, model_used = await call_llm(
            messages, system_prompt, task.tenant_id
        )

        # 3. Check for HITL Trigger
        # Trigger if confidence is low OR transfer_to_human tool called
        hitl_triggered = confidence < 0.2 or any(fc["name"] == "transfer_to_human" for fc in (function_calls or []))
        hitl_reason = None
        if hitl_triggered:
            hitl_reason = "Low confidence" if confidence < 0.2 else "Human transfer requested"

        # 4. TTS (If not HITL and enabled)
        tts_url = None
        if not hitl_triggered and response_text:
             # Using refined TTS which uploads to R2 automatically
             tts_url = await generate_and_upload_tts(
                 text=response_text, 
                 tenant_id=task.tenant_id,
                 voice_id="rachel", 
                 language="fr"
             )

        # 5. Build Result
        latency = int((time.time() - start_time) * 1000)
        result = AIResult(
            tenant_id=task.tenant_id,
            conversation_id=task.conversation_id,
            message_id=task.message_id,
            stt_text=stt_text,
            llm_response=response_text if not hitl_triggered else None,
            tts_url=tts_url,
            function_calls=function_calls or [],
            confidence_score=confidence,
            hitl_triggered=hitl_triggered,
            hitl_reason=hitl_reason,
            model_used=model_used,
            latency_ms=latency,
        )

        # 6. Publish to ai.results
        await channel.default_exchange.publish(
            aio_pika.Message(body=json.dumps(result.dict()).encode()),
            routing_key="ai.results",
        )
        print(f"Task Complete: {task.conversation_id} (Latency: {latency}ms)")

    except Exception as e:
        print(f"Pipeline Error: {e}")

async def rabbitmq_consumer():
    """RabbitMQ task listener listener."""
    while True:
        try:
            connection = await aio_pika.connect_robust(RABBITMQ_URL)
            async with connection:
                channel = await connection.channel()
                await channel.set_qos(prefetch_count=1)
                
                queue = await channel.declare_queue("ai.tasks", durable=True)
                
                print("RabbitMQ: Listening for ai.tasks...")
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        async with message.process():
                            task_data = json.loads(message.body.decode())
                            await process_ai_task(task_data, channel)
        except Exception as e:
            print(f"RabbitMQ Connection Error: {e}. Retrying in 5s...")
            await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    # Run RabbitMQ consumer in background
    asyncio.create_task(rabbitmq_consumer())

@app.get("/health")
def health():
    return {"status": "ok", "service": "pretalkme-ai"}
