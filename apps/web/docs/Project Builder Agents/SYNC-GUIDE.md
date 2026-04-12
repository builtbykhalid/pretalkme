# SYNC-GUIDE — Guide de Synchronisation Inter-Projets pretalkme
> **Document vivant — chaque agent doit le mettre à jour après sa mission.**
> Objectif : permettre aux agents IA de comprendre l'état actuel de l'interface entre les projets,
> même sans avoir le contexte des sessions précédentes.

---

## Règle d'or

**Chaque fois qu'un agent modifie une interface partagée** (endpoint API, événement Socket.io, message RabbitMQ, type partagé, variable d'env), il doit :
1. Mettre à jour la section correspondante dans ce fichier
2. Indiquer la date de la modification et le prompt responsable

---

## 1. URLs & Domaines

| Service | URL Dev | URL Prod | Statut |
|---------|---------|----------|--------|
| Frontend (apps/web) | http://localhost:3000/whatsapp | https://app.pretalk.me/whatsapp | ⏳ À déployer |
| Backend API (apps/api) | http://localhost:4000 | https://api.pretalk.me | ⏳ À déployer |
| Service IA (services/ai) | http://localhost:8000 | https://ai.pretalk.me | ⏳ À déployer |
| Médias (R2) | — | https://media.pretalk.me | ⏳ À configurer |
| Base de données | Supabase cloud | — | ⏳ À créer |

---

## 2. Routes API REST (apps/api → apps/web)

> Toutes les routes préfixées `/api/v1/`. Auth : `Authorization: Bearer <supabase_jwt>`

### Conversations
```
GET    /api/v1/conversations              → Liste (filtres: status, aiActive)
GET    /api/v1/conversations/:id          → Détail
PATCH  /api/v1/conversations/:id          → Update statut/assignation
POST   /api/v1/conversations/:id/takeover → Agent prend la main
POST   /api/v1/conversations/:id/release-ai → Repasser à l'IA
GET    /api/v1/conversations/:id/messages → Historique
POST   /api/v1/conversations/:id/messages → Envoyer message manuel
POST   /api/v1/conversations/:id/notes   → Note interne
```

### Contacts
```
GET    /api/v1/contacts          → Liste avec filtres
GET    /api/v1/contacts/:id      → Fiche contact
PATCH  /api/v1/contacts/:id      → Update tags/pipeline_stage/notes
```

### E-Commerce
```
GET    /api/v1/ecommerce/products   → Liste produits
GET    /api/v1/ecommerce/orders     → Liste commandes
POST   /api/v1/ecommerce/sync       → Déclencher sync YouCan/Shopify
```

### IA
```
GET    /api/v1/ai/config          → Config agent du tenant
PATCH  /api/v1/ai/config          → Update config agent
POST   /api/v1/ai/simulate        → Simulateur (text ou audio)
GET    /api/v1/ai/logs            → Historique ai_runs
```

### Notifications
```
GET    /api/v1/notifications             → Liste (limit 20)
GET    /api/v1/notifications/unread-count → { count: N }
PATCH  /api/v1/notifications/:id/read   → Marquer lu
PATCH  /api/v1/notifications/read-all   → Tout marquer lu
```

### Billing
```
GET    /api/v1/billing/subscription     → Plan + usage courant
POST   /api/v1/billing/portal           → Créer session portail Stripe
POST   /api/v1/billing/checkout         → Créer session checkout Stripe
```

### Settings
```
GET    /api/v1/settings/team            → Membres équipe
POST   /api/v1/settings/team/invite     → Inviter agent
DELETE /api/v1/settings/team/:userId    → Retirer membre
GET    /api/v1/settings/integrations    → Intégrations actives
POST   /api/v1/settings/integrations/youcan   → Connecter YouCan
POST   /api/v1/settings/integrations/shopify  → Connecter Shopify
```

### Webhooks (publics)
```
GET/POST /webhook/meta       → Webhook Meta WhatsApp
POST     /billing/webhook    → Webhook Stripe
GET      /health             → Health check
```

---

## 3. Événements Socket.io (apps/api ↔ apps/web)

> Namespace : `/` | Auth : `{ token: supabase_access_token }` au handshake

### Émis par le CLIENT (apps/web → apps/api)
```
join_inbox          → { tenantId }   — rejoindre la room du tenant
heartbeat           → {}             — maintenir le statut "en ligne" (toutes les 30s)
```

### Émis par le SERVEUR (apps/api → apps/web)
```
message.new           → Message       — nouveau message entrant/sortant
conversation.updated  → Conversation  — mise à jour statut/assignation/unread
ai.thinking           → { conversationId }  — l'IA traite (afficher typing)
hitl.triggered        → { conversationId, reason }  — transfert à un humain
notification          → Notification  — nouvelle notification in-app
```

### Types des payloads
```typescript
// Message
{ id, conversationId, direction, type, content, mediaUrl, isAiGenerated, status, createdAt }

// Notification
{ id, type, title, body, metadata, createdAt }
// types: 'new_message' | 'hitl_triggered' | 'conversation_assigned' | 'quota_warning'
```

---

## 4. Queues RabbitMQ (apps/api ↔ services/ai)

### `ai.tasks` (NestJS → FastAPI)
```json
{
  "tenant_id": "uuid",
  "conversation_id": "uuid",
  "message_id": "uuid",
  "text_message": "string | null",
  "audio_url": "string | null"
}
```

### `ai.results` (FastAPI → NestJS)
```json
{
  "tenant_id": "uuid",
  "conversation_id": "uuid",
  "message_id": "uuid",
  "stt_text": "string | null",
  "llm_response": "string | null",
  "tts_url": "string | null",
  "function_calls": [],
  "confidence_score": 0.87,
  "hitl_triggered": false,
  "hitl_reason": "string | null",
  "model_used": "gpt-4o",
  "latency_ms": 1250
}
```

### `whatsapp.outbound` (NestJS interne)
```json
{
  "tenantId": "uuid",
  "conversationId": "uuid",
  "toPhone": "+212612345678",
  "phoneId": "meta_phone_number_id",
  "metaToken": "encrypted_token",
  "textResponse": "string | null",
  "audioUrl": "string | null"
}
```

---

## 5. Types partagés (packages/shared)

> Fichier de référence : `packages/shared/types/index.ts`

```typescript
// Statuts conversation
type ConversationStatus = 'open' | 'pending_human' | 'resolved' | 'closed'

// Types messages
type MessageDirection = 'inbound' | 'outbound'
type MessageType = 'text' | 'audio' | 'image' | 'video' | 'document' | 'template'
type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

// Rôles utilisateurs
type UserRole = 'owner' | 'admin' | 'agent' | 'viewer'

// Plans
type Plan = 'trial' | 'solo' | 'pro' | 'agence'

// Pipeline CRM
type PipelineStage = 'new' | 'qualified' | 'proposed' | 'negotiating' | 'won' | 'lost'
```

---

## 6. Variables d'Environnement — Récapitulatif

### apps/web (`.env.local`)
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:4000         # prod: https://api.pretalk.me
VITE_WS_URL=ws://localhost:4000            # prod: wss://api.pretalk.me
```

### apps/api (`.env`)
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RABBITMQ_URL=amqp://pretalkme:secret@localhost:5672
REDIS_URL=redis://localhost:6379
META_APP_SECRET=
META_VERIFY_TOKEN=
META_GRAPH_API_VERSION=v19.0
R2_ENDPOINT=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=pretalk-media
R2_PUBLIC_URL=https://media.pretalk.me
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
CORS_ORIGIN=https://app.pretalk.me
PORT=4000
```

### services/ai (`.env`)
```env
RABBITMQ_URL=amqp://pretalkme:secret@localhost:5672
REDIS_URL=redis://localhost:6379
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
R2_ENDPOINT=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=pretalk-media
QDRANT_URL=http://localhost:6333
PORT=8000
```

---

## 7. État d'Avancement des Prompts

> Mettre à jour ce tableau au fur et à mesure des missions.

| Prompt | Mission | Statut | Notes |
|--------|---------|--------|-------|
| 00 | Contexte CTO | ✅ Référence | À joindre à chaque session |
| 01 | Setup Monorepo | ✅ Terminé | Structure, API scaffold, shared packages, AI Dockerfile |
| 02 | Purge & Adaptation web | ⏳ À faire | |
| 03 | UI Inbox | ⏳ À faire | Dépend de 02 |
| 04 | UI Pages secondaires | ⏳ À faire | Dépend de 02 |
| 05 | Landing page | 🔄 Différé | Simple page plus tard |
| 06 | Backend NestJS | ⏳ À faire | |
| 07 | Service IA FastAPI | ⏳ À faire | Dépend de 06 |
| 08 | Database Supabase | ⏳ À faire | À faire EN PREMIER |
| 09 | Infra Coolify/Cloudflare | ⏳ À faire | |
| 10 | Emails transactionnels | ⏳ À faire | Dépend de 06 |
| 11 | Notifications | ⏳ À faire | Dépend de 06 et 10 |

**Légende :** ✅ Terminé | ⏳ À faire | 🔄 En cours | ❌ Bloqué | 🔄 Différé

---

## 8. Décisions d'Architecture (Log des changements)

> Chaque décision importante doit être documentée ici avec la date.

```
2026-04-09 : URL app → app.pretalk.me/whatsapp (pas un nouveau domaine pretalkme.com)
2026-04-09 : Landing page différée → simple page pretalk.me/whatsapp-ai-agents plus tard
2026-04-09 : Audio inclus dès V1 (différenciateur vs MyAgent.ma)
2026-04-09 : Service email : Resend (pas Brevo, pas SendGrid)
2026-04-09 : Basename React Router : /whatsapp (BrowserRouter basename="/whatsapp")
```

---

## Comment utiliser ce fichier (Instructions pour les agents)

1. **Avant de commencer** : Lire ce fichier pour connaître l'état actuel du projet.
2. **Pendant la mission** : Si tu modifies une interface (API, event, type), note-le ici.
3. **Après la mission** : Mettre à jour la section "État d'Avancement" et "Décisions d'Architecture".
4. **Si tu as un doute** : Chercher dans ce fichier plutôt que d'inventer — les interfaces sont ici.

**Ce fichier est la source de vérité pour les interfaces entre projets.**
