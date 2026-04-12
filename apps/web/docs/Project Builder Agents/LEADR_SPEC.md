# 🏗️ Plan Architecte & CTO — pretalkme
## Plateforme SaaS WhatsApp IA · E-Commerce MENA · Voice-First
> Document maître · Usage interne équipe développement
> Projet : **pretalkme** | Domaine cible : `pretalkme.com`
> Basé sur : fork de `pretalk-hub` + nouveau backend `pretalkme-api`

---

## 0. Contexte & Vision Produit

### Pourquoi ce projet existe

**pretalkme** est une plateforme SaaS multi-tenant destinée aux e-commerçants et agences du marché MENA (Maroc en priorité). Elle combine un **CRM WhatsApp collaboratif multi-agents**, un **agent IA vocal** (comprend et répond en voice note), et une **intégration e-commerce native** (YouCan, Shopify, WooCommerce).

La différenciation principale face aux concurrents (ex: MyAgent.ma) :
- **Voice-first** : l'agent IA reçoit des voice notes WhatsApp, transcrit (STT), génère une réponse contextuelle, et renvoie un message audio (.ogg) — automatiquement.
- **Plateforme équipe** : inbox multi-agents, transfert humain (HITL) fluide et auditable.
- **E-commerce profond** : check_stock, get_order_status, suggest_alternative — câblés nativement avec YouCan/Shopify.
- **Flow Builder** : automatisation drag-and-drop sans code.

### Origine technique

Le projet **prétalk-hub** (repo existant) sert de boilerplate. Il apporte :
- Stack Astro + React déjà fonctionnelle et dockerisée
- Design system complet (Tailwind CSS, ShadCN/ui, Framer Motion)
- Auth Supabase déjà câblée (JWT, Google OAuth, Magic Link)
- Pattern AppContext + routing React SPA opérationnel
- Dockerfile multi-stage prêt pour Coolify

**Ce qu'on NE réutilise PAS** de pretalk : le serveur Express, le form builder, la gestion de leads/PDF, l'intégration n8n/Brevo.

---

## 1. Structure des Projets (Monorepo)

```
pretalkme/                        ← Racine monorepo (Turborepo)
├── apps/
│   ├── web/                      ← Fork de pretalk-hub (Astro + React)
│   │   └── [voir Section 2]
│   └── api/                      ← NestJS Backend Core (nouveau)
│       └── [voir Section 3]
├── services/
│   └── ai/                       ← FastAPI Service IA Python (voir Section 4)
├── packages/
│   └── shared/                   ← Types TypeScript partagés web ↔ api
│       ├── types/
│       │   ├── tenant.ts
│       │   ├── conversation.ts
│       │   ├── message.ts
│       │   ├── contact.ts
│       │   ├── order.ts
│       │   ├── product.ts
│       │   ├── ai-run.ts
│       │   └── plan.ts
│       └── constants/
│           ├── planLimits.ts     ← Source de vérité des plans/quotas
│           └── hitlTriggers.ts
├── infra/
│   ├── docker-compose.yml        ← Dev local (tous services)
│   ├── docker-compose.prod.yml   ← Référence prod (Coolify override)
│   └── nginx/                    ← Config reverse proxy si besoin
├── turbo.json
├── package.json
└── README.md
```

### Nommage des services déployés

| Service | Repo interne | URL Prod | Technologie |
|---------|-------------|----------|-------------|
| Frontend | `apps/web` | `pretalkme.com` | Astro 5 + React 19 |
| Backend API | `apps/api` | `api.pretalkme.com` | NestJS + Socket.io |
| Service IA | `services/ai` | `ai.pretalkme.com` | FastAPI + Python 3.11 |
| Base de données | Supabase cloud | — | PostgreSQL + RLS |
| Cache / Sessions | Redis | — | Redis 7 (Coolify) |
| Message Queue | RabbitMQ | — | RabbitMQ 3 (Coolify) |
| Médias / Audio | Cloudflare R2 | — | S3-compatible |
| CDN / DNS | Cloudflare | — | Proxy + SSL |

---

## 2. apps/web — Fork de pretalk-hub

### 2.1 Mission Globale

Transformer le repo `pretalk-hub` en frontend pretalkme. Le résultat est une **application hybride Astro** : pages marketing statiques (SEO) + SPA React pour le dashboard produit.

### 2.2 Étape 1 — Purge du codebase pretalk

> **Assigné à** : Dev Frontend | **Priorité** : Critique (bloquer tout le reste)

**Fichiers et dossiers à supprimer** :

```
src/server/                           ← Supprimer entièrement (Express remplacé par NestJS)
src/components/ReactApp/pages/Forms.tsx
src/components/ReactApp/pages/FormBuilder.tsx
src/components/ReactApp/pages/Agents.tsx      ← À recréer pour les agents WhatsApp
src/components/ReactApp/components/RealTimeFormPreview.tsx
src/components/ReactApp/lib/n8n.ts
src/components/ReactApp/lib/phaseConfig.ts
src/components/ReactApp/lib/pdf.ts
src/templates/                        ← Templates email/PDF pretalk
src/data/                             ← Données statiques pretalk
scripts/                              ← Scripts PDF pretalk
config/brevo_templates.json
BLOG_CMS_PLAN.md
DELIVERY_SUMMARY.md
FEASIBILITY.md
```

**Fichiers à conserver intacts** :
```
src/components/ReactApp/context/AppContext.tsx   ← Adapter (voir 2.3)
src/components/ReactApp/lib/supabase.ts          ← Conserver
src/components/ReactApp/hooks/                   ← Conserver et étendre
src/components/Landing/                          ← Refaire le contenu, garder la structure
src/components/Pricing/                          ← Refaire les plans
src/pages/index.astro                            ← Refaire le contenu
src/pages/blog/                                  ← Conserver (SEO)
src/pages/legal/                                 ← Conserver
astro.config.mjs                                 ← Conserver, adapter
Dockerfile                                       ← Adapter (retirer Express)
```

**Dépendances npm à retirer** :
```
express, @types/express
gotenberg (plus dans le projet)
```

**Dépendances npm à ajouter** :
```
socket.io-client          ← Temps réel inbox
zustand                   ← State management global
axios                     ← HTTP vers api.pretalkme.com
@dnd-kit/core             ← Drag-and-drop Kanban + Flow Builder
@dnd-kit/sortable
reactflow                 ← Flow Builder canvas (alternative : xyflow)
wavesurfer.js             ← Player audio voice notes inline
```

---

### 2.3 Étape 2 — Adaptation du Core Frontend

#### AppContext.tsx
Remplacer le contexte existant par un contexte pretalkme :
- Retirer : références forms, leads, PDF, n8n
- Ajouter : `tenantId`, `currentConversation`, `aiStatus`, `agentRole`
- Conserver : `user`, `session`, `signIn/Out`, `plan`

#### Routing React (react-router-dom)
Remplacer les routes pretalk par l'arborescence pretalkme :

```
/app/inbox                    ← Inbox WhatsApp (page principale)
/app/inbox/:conversationId    ← Conversation ouverte
/app/crm                      ← CRM contacts + pipeline Kanban
/app/crm/:contactId           ← Fiche contact
/app/campaigns                ← Campagnes broadcast
/app/flows                    ← Flow Builder
/app/ecommerce/products       ← Produits (sync YouCan/Shopify)
/app/ecommerce/orders         ← Commandes
/app/ai-agent                 ← Config + simulateur agent IA
/app/ai-agent/logs            ← Logs audio IA
/app/analytics                ← Dashboard KPIs
/app/settings                 ← Settings tenant (WABA, intégrations, équipe)
/app/settings/billing         ← Abonnement Stripe
/app/onboarding               ← Wizard d'onboarding (nouveau tenant)
```

#### Sidebar Navigation
```tsx
// Structure de la sidebar adaptée pretalkme
const navItems = [
  { label: 'Inbox',       icon: MessageSquare, path: '/app/inbox',      badge: 'unread' },
  { label: 'CRM',         icon: Users,         path: '/app/crm' },
  { label: 'Campagnes',   icon: Megaphone,     path: '/app/campaigns' },
  { label: 'Flows',       icon: GitBranch,     path: '/app/flows' },
  { label: 'E-Commerce',  icon: ShoppingBag,   path: '/app/ecommerce/products' },
  { label: 'Agent IA',    icon: Bot,           path: '/app/ai-agent' },
  { label: 'Analytics',   icon: BarChart2,     path: '/app/analytics' },
  { label: 'Paramètres',  icon: Settings,      path: '/app/settings' },
]
```

---

### 2.4 Étape 3 — Nouvelles Pages React à Créer

#### Page : Inbox (`/app/inbox`)

**Layout 3 colonnes (desktop)** :
```
[ Sidebar ] | [ Liste Conversations ] | [ Chat + Panneau CRM ]
```

**Liste Conversations** :
- Chaque item : avatar, nom, dernier message, timestamp, badge 🤖/👤
- Filtres : Tous | IA Active | Humain Assigné | En attente | Résolu
- Recherche full-text
- Connexion Socket.io : écouter `conversation.updated`, `message.new`

**Zone Chat** :
- Bulles WhatsApp-style (texte, image, voice note, document)
- Voice note : player inline avec `wavesurfer.js` (forme d'onde + timeline)
- Badge "Message IA" (couleur distincte + icône 🤖)
- Zone de saisie : texte + emoji + pièce jointe + note interne
- Bouton **"Prendre la main"** → envoie `HITL_OVERRIDE` via API → l'IA s'arrête
- Bouton **"Repasser à l'IA"** → réactive le mode automatique
- Indicateur typing IA ("pretalkme réfléchit...") pendant traitement audio

**Panneau CRM Contact** (colonne droite bas) :
- Nom, numéro WA, source, date premier contact
- Tags éditables inline
- Pipeline stage (dropdown ou mini-kanban)
- Historique commandes liées
- Notes internes équipe
- Timeline HITL : "IA a transféré le 12/04 à 14h32 — raison : ton agressif"

**State Management (Zustand)** :
```ts
// stores/useChatStore.ts
interface ChatStore {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  socketConnected: boolean
  setConversations: (c: Conversation[]) => void
  addMessage: (convId: string, msg: Message) => void
  setActiveConversation: (id: string) => void
}
```

**Connexion Socket.io** :
```ts
// hooks/useSocket.ts
const socket = io('https://api.pretalkme.com', {
  auth: { token: supabaseSession.access_token },
  transports: ['websocket']
})
socket.on('message.new', (msg) => useChatStore.getState().addMessage(msg.conversationId, msg))
socket.on('conversation.updated', (conv) => /* update list */)
socket.on('ai.thinking', (data) => /* show typing indicator */)
socket.on('hitl.triggered', (data) => /* show alert + move conv to human tab */)
```

---

#### Page : CRM (`/app/crm`)

- Table contacts + Kanban pipeline (drag-and-drop avec `@dnd-kit`)
- Stages Kanban : Nouveau → Qualifié → Proposé → En négociation → Gagné / Perdu
- Fiche contact complète : historique messages, commandes, notes, timeline

#### Page : Flow Builder (`/app/flows`)

- Canvas infini avec `reactflow` (ou xyflow)
- Nodes disponibles : voir spec Section 3 du document original
- Node spécial **"Transfert Humain (HITL)"** : paramètres agent cible, priorité, message auto
- Mode simulation : tester un flow avec un message fictif
- Sauvegarde : POST `/api/flows` → NestJS → Supabase

#### Page : E-Commerce (`/app/ecommerce`)

**Onglet Produits** :
- Table : Nom | SKU | Prix | Stock | Statut
- Badge rouge "Rupture de stock"
- Bouton "Synchroniser" → appel API YouCan/Shopify

**Onglet Commandes** :
- Table : ID | Client | Date | Statut | Montant
- Clic → détail commande + lien vers conversation WA
- Bouton "Envoyer update WhatsApp" (template confirmation/expédition)

#### Page : Agent IA (`/app/ai-agent`)

**3 panneaux** :
1. **Simulateur** : input texte OU upload voice note → voir transcription STT + réponse texte + player TTS
2. **Configuration** : nom agent, voix TTS, langue (FR/AR/Darija), seuil HITL (slider), mode sécurité, system prompt, catalogue RAG
3. **Logs** : historique ai_runs (timestamp, contact, STT, LLM, TTS, statut)

Badges indicateurs :
- `✅ IA confident` — envoi automatique
- `⚠️ Score faible` — validation humaine requise
- `🔴 Transfert forcé` — réclamation détectée

#### Page : Onboarding (`/app/onboarding`)

Wizard 4 étapes :
1. **Connexion WhatsApp** : Meta Embedded Signup (popup officiel) → WABA connecté
2. **Connexion E-Commerce** : YouCan / Shopify / WooCommerce (OAuth + store URL)
3. **Configuration Agent IA** : langue, voix, seuil HITL, instructions système
4. **Sync initiale** : produits + commandes existantes chargés

#### Page : Settings (`/app/settings`)

- Profil tenant (nom, logo, fuseau horaire)
- Gestion équipe : inviter agents, définir rôles (owner/admin/agent/viewer)
- Intégrations actives (WABA, YouCan, Shopify)
- Billing : plan actuel, usage du mois, lien portail Stripe

---

### 2.5 Étape 4 — Pages Marketing Astro (SEO)

Refaire les pages Astro existantes avec le contenu pretalkme. Garder la structure Astro, changer uniquement le contenu.

**Pages à réécrire** :
- `src/pages/index.astro` ← Landing page pretalkme (hero, features, pricing, FAQ)
- `src/components/Landing/` ← Sections : HeroSection, FeaturesSection, VoiceFeatureSection, PricingSection, ComparisonSection (vs MyAgent), TestimonialsSection, FAQSection, CTASection
- `src/components/Pricing/` ← Plans en MAD : Solo (690 MAD), Pro (1490 MAD), Agence (3490 MAD)
- `src/pages/[username].astro` → **Supprimer** (profil public n'existe pas dans pretalkme)

**Pages verticales SEO à créer** (nouvelles pages Astro) :
```
src/pages/solutions/ecommerce.astro
src/pages/solutions/immobilier.astro
src/pages/solutions/salons.astro
src/pages/solutions/restaurants.astro
```

**Variables d'env à adapter** (`.env`) :
```env
# Supabase (conserver les clés)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# API Backend
VITE_API_URL=https://api.pretalkme.com
VITE_WS_URL=wss://api.pretalkme.com

# Sentry (optionnel)
SENTRY_ORG=...
SENTRY_PROJECT=pretalkme-web
```

---

### 2.6 Dockerfile apps/web (adapté)

```dockerfile
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE vars passées au build (obligatoire pour CSR)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ARG VITE_WS_URL
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json .
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "./dist/server/entry.mjs"]
```

---

## 3. apps/api — NestJS Backend Core

### 3.1 Mission Globale

Nouveau projet NestJS standalone. Responsable de : réception webhooks Meta, orchestration IA via RabbitMQ, gestion conversations/contacts/CRM, intégrations e-commerce, billing Stripe, WebSocket temps réel.

### 3.2 Structure des Modules NestJS

```
apps/api/src/
├── main.ts                         ← Bootstrap + CORS + Socket.io
├── app.module.ts                   ← Root module
│
├── modules/
│   ├── auth/                       ← Validation JWT Supabase (Guard)
│   │   ├── auth.guard.ts
│   │   ├── tenant.decorator.ts
│   │   └── roles.guard.ts
│   │
│   ├── tenants/                    ← Gestion tenants (onboarding, config)
│   │   ├── tenants.module.ts
│   │   ├── tenants.controller.ts
│   │   └── tenants.service.ts
│   │
│   ├── whatsapp/                   ← Webhook Meta + envoi messages
│   │   ├── whatsapp.module.ts
│   │   ├── whatsapp.controller.ts  ← POST /webhook/meta (verification + events)
│   │   ├── whatsapp.service.ts     ← Envoi via Meta Graph API
│   │   └── meta-graph.client.ts    ← Wrapper HTTP Meta API
│   │
│   ├── conversations/              ← Gestion conversations + messages
│   │   ├── conversations.module.ts
│   │   ├── conversations.controller.ts
│   │   ├── conversations.service.ts
│   │   └── conversations.gateway.ts ← Socket.io WebSocket Gateway
│   │
│   ├── contacts/                   ← CRM contacts
│   │   ├── contacts.module.ts
│   │   ├── contacts.controller.ts
│   │   └── contacts.service.ts
│   │
│   ├── ai/                         ← Orchestration IA (publisher RabbitMQ)
│   │   ├── ai.module.ts
│   │   ├── ai.controller.ts        ← Simulateur (POST /ai/simulate)
│   │   ├── ai.service.ts           ← Publish ai.tasks, consume ai.results
│   │   └── ai-config.service.ts    ← Config agent par tenant
│   │
│   ├── campaigns/                  ← Broadcast WhatsApp
│   │   ├── campaigns.module.ts
│   │   ├── campaigns.controller.ts
│   │   └── campaigns.service.ts
│   │
│   ├── flows/                      ← Exécution des flows automation
│   │   ├── flows.module.ts
│   │   ├── flows.controller.ts
│   │   └── flows-executor.service.ts ← State machine Redis
│   │
│   ├── ecommerce/                  ← Intégrations e-commerce
│   │   ├── ecommerce.module.ts
│   │   ├── ecommerce.controller.ts
│   │   ├── youcan.client.ts        ← YouCan API
│   │   ├── shopify.client.ts       ← Shopify API
│   │   ├── woocommerce.client.ts   ← WooCommerce REST API
│   │   └── sync.service.ts         ← Sync produits + commandes
│   │
│   ├── billing/                    ← Stripe subscriptions + metered billing
│   │   ├── billing.module.ts
│   │   ├── billing.controller.ts   ← POST /billing/webhook (Stripe events)
│   │   └── billing.service.ts
│   │
│   └── notifications/              ← Notifications temps réel agents
│       ├── notifications.module.ts
│       └── notifications.gateway.ts
│
├── infrastructure/
│   ├── supabase/
│   │   └── supabase.client.ts      ← Client service role
│   ├── redis/
│   │   └── redis.service.ts        ← Sessions, contexte IA, locks
│   ├── rabbitmq/
│   │   └── rabbitmq.module.ts      ← Queues config
│   └── r2/
│       └── r2.service.ts           ← Upload médias (Cloudflare R2 S3-compat)
│
└── common/
    ├── guards/
    ├── decorators/
    ├── filters/
    └── interceptors/
```

---

### 3.3 Flows RabbitMQ — Queues et Responsabilités

```
Queues NestJS ↔ FastAPI :

whatsapp.inbound       ← NestJS publie chaque message Meta entrant
ai.tasks               ← NestJS publie une tâche IA (texte ou audio URL)
ai.results             ← FastAPI publie la réponse IA traitée
whatsapp.outbound      ← NestJS consomme et envoie via Meta Graph API
notifications          ← NestJS publie pour Socket.io Gateway
dlq.rejected           ← Dead Letter Queue (erreurs IA, Meta rejet)
```

**Flow complet message entrant** :
```
1. POST /webhook/meta (NestJS WhatsappController)
2. → Vérification signature HMAC Meta
3. → Publier sur whatsapp.inbound
4. NestJS consumer : sauvegarder message en DB (Supabase)
5. → Si ai_active = true pour cette conversation
6.    → Publier sur ai.tasks { tenantId, conversationId, message, audioUrl? }
7. FastAPI consumer (ai.tasks)
8. → STT si audioUrl (Faster-Whisper)
9. → Contexte Redis + RAG Qdrant
10. → LLM (GPT-4o / Claude / Llama)
11. → Function calls si nécessaire
12. → TTS si vocal activé (ElevenLabs/XTTS → .ogg → R2)
13. → Évaluer confidence_score
14. → Si confidence < seuil → transfer_to_human()
15. FastAPI publie sur ai.results { response, ttsUrl?, confidence, hitlTriggered }
16. NestJS consumer (ai.results)
17. → Sauvegarder ai_run en DB
18. → Si hitlTriggered : tag contact + note interne + émettre hitl.triggered via Socket.io
19. → Sinon : publier sur whatsapp.outbound
20. NestJS consumer (whatsapp.outbound)
21. → Envoyer texte ET/OU voice note (.ogg) via Meta Graph API
22. → Émettre message.new via Socket.io → update inbox temps réel
```

---

### 3.4 API REST — Endpoints Principaux

```
# Auth (toutes les routes /api/* nécessitent Authorization: Bearer <supabase_jwt>)

# Tenants
POST   /api/tenants/onboard          ← Créer tenant + connecter WABA
GET    /api/tenants/me               ← Config tenant courant
PATCH  /api/tenants/me               ← Mettre à jour config

# WhatsApp
POST   /webhook/meta                 ← Webhook Meta (public, signature HMAC)
GET    /webhook/meta                 ← Verification webhook Meta (challenge)

# Conversations
GET    /api/conversations            ← Liste conversations (filtres, pagination)
GET    /api/conversations/:id        ← Détail conversation
PATCH  /api/conversations/:id        ← Update statut (assigné, résolu, HITL)
POST   /api/conversations/:id/takeover    ← Agent prend la main (désactive IA)
POST   /api/conversations/:id/release-ai  ← Repasser à l'IA

# Messages
GET    /api/conversations/:id/messages    ← Historique messages
POST   /api/conversations/:id/messages    ← Envoyer message manuel (agent)
POST   /api/conversations/:id/notes      ← Ajouter note interne

# Contacts
GET    /api/contacts                 ← Liste contacts CRM
GET    /api/contacts/:id             ← Fiche contact
PATCH  /api/contacts/:id             ← Update (tags, pipeline_stage, notes)
GET    /api/contacts/:id/conversations

# Campaigns
GET    /api/campaigns
POST   /api/campaigns                ← Créer campagne
POST   /api/campaigns/:id/send       ← Lancer broadcast
GET    /api/campaigns/:id/stats

# Flows
GET    /api/flows
POST   /api/flows                    ← Créer/sauvegarder flow
PUT    /api/flows/:id
PATCH  /api/flows/:id/toggle         ← Activer/désactiver

# E-Commerce
GET    /api/ecommerce/products
POST   /api/ecommerce/sync           ← Déclencher sync YouCan/Shopify
GET    /api/ecommerce/orders
GET    /api/ecommerce/orders/:id

# AI Agent
GET    /api/ai/config                ← Config agent du tenant
PATCH  /api/ai/config                ← Mettre à jour config agent
POST   /api/ai/simulate              ← Simulateur (texte ou audio upload)
GET    /api/ai/logs                  ← Historique ai_runs

# Billing
GET    /api/billing/subscription     ← Plan + usage courant
POST   /api/billing/portal           ← Créer session portail Stripe
POST   /billing/webhook              ← Webhook Stripe (public)

# Settings
GET    /api/settings/team            ← Membres équipe
POST   /api/settings/team/invite     ← Inviter agent
DELETE /api/settings/team/:userId    ← Retirer membre
GET    /api/settings/integrations    ← Intégrations actives
POST   /api/settings/integrations/youcan
POST   /api/settings/integrations/shopify
```

---

### 3.5 WebSocket Gateway (Socket.io)

```ts
// conversations.gateway.ts
@WebSocketGateway({ cors: { origin: 'https://pretalkme.com' } })
export class ConversationsGateway {
  // Auth middleware : valider JWT Supabase au handshake
  // Rooms : chaque tenant dans room `tenant:{tenantId}`

  @SubscribeMessage('join_inbox')
  handleJoinInbox(client: Socket, tenantId: string) {
    client.join(`tenant:${tenantId}`)
  }

  // Événements émis vers le frontend :
  emitNewMessage(tenantId, message)         // 'message.new'
  emitConversationUpdate(tenantId, conv)    // 'conversation.updated'
  emitAIThinking(tenantId, convId)          // 'ai.thinking'
  emitHITLTriggered(tenantId, data)         // 'hitl.triggered'
  emitNotification(tenantId, notif)         // 'notification'
}
```

---

### 3.6 Guards & Middleware NestJS

```ts
// Plan Guard (équivalent de planGuard.ts de pretalk, adapté pretalkme)
// Métriques : conversations_month, ai_credits_month, wa_numbers, team_members, broadcasts_month

@Injectable()
export class PlanGuard implements CanActivate {
  // Vérifie quota via Supabase RPC check_plan_limit(tenantId, metric)
  // 403 si dépassé avec message et metric
}

// Tenant Guard
@Injectable()
export class TenantGuard implements CanActivate {
  // Extrait tenantId du JWT Supabase user_metadata
  // Injecte dans request.tenantId
}

// Feature Guard
@Injectable()
export class FeatureGuard implements CanActivate {
  // Boolean features : flow_builder, voice_ai, multi_whatsapp, white_label
}
```

---

### 3.7 Variables d'Env apps/api

```env
# Supabase
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# RabbitMQ
RABBITMQ_URL=amqp://user:pass@rabbitmq:5672

# Redis
REDIS_URL=redis://redis:6379

# Meta WhatsApp
META_APP_SECRET=...            ← Signature HMAC webhook
META_GRAPH_API_VERSION=v19.0

# Cloudflare R2
R2_ENDPOINT=...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_BUCKET=pretalkme-media

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Service IA
AI_SERVICE_URL=http://ai:8000   ← Interne Docker ou https://ai.pretalkme.com

# CORS
CORS_ORIGIN=https://pretalkme.com

PORT=4000
```

---

### 3.8 Dockerfile apps/api

```dockerfile
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

---

## 4. services/ai — FastAPI Service IA

### 4.1 Mission Globale

Service Python autonome. Consomme la queue `ai.tasks`, exécute le pipeline STT → LLM → TTS, publie sur `ai.results`. Exposé aussi en HTTP pour le simulateur.

### 4.2 Structure

```
services/ai/
├── main.py                    ← FastAPI app + RabbitMQ consumer
├── pipeline/
│   ├── stt.py                 ← Faster-Whisper (Darija/AR/FR)
│   ├── llm_router.py          ← GPT-4o → Claude → Llama (selon plan + crédits)
│   ├── tts.py                 ← ElevenLabs / XTTS → FFmpeg → .ogg
│   └── rag.py                 ← Qdrant embeddings (produits, FAQ, politique)
├── functions/
│   ├── check_stock.py         ← Query Supabase produits
│   ├── get_order_status.py    ← Query Supabase commandes
│   ├── suggest_alternative.py ← Qdrant similarity search
│   └── transfer_to_human.py   ← Publish NestJS notification
├── prompts/
│   └── system_prompt.py       ← System prompt de base (multilingue)
├── models/
│   └── schemas.py             ← Pydantic models
├── requirements.txt
└── Dockerfile
```

### 4.3 Pipeline Détaillé

```python
async def process_ai_task(task: AITask):
    text_input = task.text_message
    
    # 1. STT si voice note
    if task.audio_url:
        audio_bytes = await download_from_r2(task.audio_url)
        text_input = await transcribe(audio_bytes)  # Faster-Whisper
    
    # 2. Contexte conversation (Redis : N derniers messages)
    context = await redis.get(f"ctx:{task.conversation_id}")
    
    # 3. RAG (Qdrant : produits et FAQ du tenant)
    rag_chunks = await rag.search(text_input, tenant_id=task.tenant_id)
    
    # 4. LLM
    response, function_calls, confidence = await llm_router.call(
        system_prompt=await get_system_prompt(task.tenant_id),
        user_message=text_input,
        context=context,
        rag_chunks=rag_chunks,
        functions=[check_stock, get_order_status, suggest_alternative, transfer_to_human]
    )
    
    # 5. Évaluer HITL
    if confidence < tenant_config.hitl_threshold or is_complaint(text_input):
        await transfer_to_human(task.conversation_id, reason="...")
        return AIResult(hitl_triggered=True, ...)
    
    # 6. TTS si mode vocal activé
    tts_url = None
    if tenant_config.voice_enabled:
        ogg_bytes = await tts.generate(response, voice=tenant_config.voice_id)
        tts_url = await upload_to_r2(ogg_bytes, f"{task.conversation_id}.ogg")
    
    # 7. Publier résultat
    await rabbitmq.publish('ai.results', AIResult(
        conversation_id=task.conversation_id,
        stt_text=text_input,
        llm_response=response,
        tts_url=tts_url,
        confidence_score=confidence,
        function_calls=function_calls,
        hitl_triggered=False
    ))
```

### 4.4 Conditions HITL automatiques

| Condition | Déclencheur | Action |
|-----------|-------------|--------|
| confidence < seuil tenant | IA incertaine | Transfer + note |
| Mots-clés réclamation | "remboursement", "arnaque", "problème" | Transfer + tag `réclamation` + priorité haute |
| Sentiment très négatif | Score sentiment < -0.7 | Transfer + note "Ton agressif" |
| 3 échanges sans résolution | Loop détecté | Transfer + note |
| Hors scope catalogue | Function call échoue × 2 | Transfer + note |
| Mode sécurité ON | Toujours | File validation humaine |

### 4.5 Dockerfile services/ai

```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 5. Base de Données — Supabase PostgreSQL

### 5.1 Schéma Complet

```sql
-- ═══════════════════════════════════════════════
-- MULTI-TENANCY
-- ═══════════════════════════════════════════════

CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'trial',  -- trial|solo|pro|agence
  -- WhatsApp
  wa_phone_id   TEXT,          -- Meta phone_number_id
  wa_number     TEXT,          -- +2126XXXXXXXX
  meta_token    TEXT,          -- Chiffré AES-256
  waba_id       TEXT,
  -- Config IA
  ai_enabled    BOOLEAN DEFAULT false,
  ai_voice_enabled BOOLEAN DEFAULT false,
  ai_voice_id   TEXT DEFAULT 'elevenlabs_default',
  ai_language   TEXT DEFAULT 'fr',
  ai_hitl_threshold FLOAT DEFAULT 0.7,
  ai_safety_mode BOOLEAN DEFAULT true,
  ai_system_prompt TEXT,
  -- Meta
  created_at    TIMESTAMPTZ DEFAULT now(),
  trial_ends_at TIMESTAMPTZ
);

CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users,
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email         TEXT,
  role          TEXT DEFAULT 'agent',  -- owner|admin|agent|viewer
  name          TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- WHATSAPP & CRM
-- ═══════════════════════════════════════════════

CREATE TABLE contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  wa_id         TEXT NOT NULL,          -- WhatsApp ID (phone@c.us)
  phone         TEXT NOT NULL,
  name          TEXT,
  tags          TEXT[] DEFAULT '{}',
  pipeline_stage TEXT DEFAULT 'new',   -- new|qualified|proposed|negotiating|won|lost
  source        TEXT,                   -- whatsapp|avito|instagram|direct
  opt_out       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, wa_id)
);

CREATE TABLE conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id    UUID REFERENCES contacts(id),
  status        TEXT DEFAULT 'open',    -- open|pending_human|resolved|closed
  assigned_agent_id UUID REFERENCES users(id),
  ai_active     BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  unread_count  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  direction     TEXT NOT NULL,          -- inbound|outbound
  type          TEXT NOT NULL,          -- text|audio|image|video|document|template
  content       TEXT,
  media_url     TEXT,                   -- R2 URL pour audio/image
  is_ai_generated BOOLEAN DEFAULT false,
  ai_confidence FLOAT,
  wamid         TEXT,                   -- Meta message ID
  status        TEXT DEFAULT 'sent',    -- sent|delivered|read|failed
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE internal_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id      UUID REFERENCES users(id),
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- E-COMMERCE
-- ═══════════════════════════════════════════════

CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  external_id   TEXT NOT NULL,
  platform      TEXT NOT NULL,          -- youcan|shopify|woocommerce
  name          TEXT NOT NULL,
  sku           TEXT,
  price         NUMERIC(10,2),
  stock         INTEGER DEFAULT 0,
  category      TEXT,
  tags          TEXT[] DEFAULT '{}',
  image_url     TEXT,
  synced_at     TIMESTAMPTZ,
  UNIQUE(tenant_id, platform, external_id)
);

CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  external_id   TEXT NOT NULL,
  platform      TEXT NOT NULL,
  contact_id    UUID REFERENCES contacts(id),
  status        TEXT,                   -- new|confirmed|shipped|delivered|returned|cancelled
  total         NUMERIC(10,2),
  items_json    JSONB,
  address_json  JSONB,
  tracking_url  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, platform, external_id)
);

CREATE TABLE integrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL,          -- youcan|shopify|woocommerce
  access_token  TEXT,                   -- Chiffré
  store_url     TEXT,
  webhook_secret TEXT,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, platform)
);

-- ═══════════════════════════════════════════════
-- IA & FLOWS
-- ═══════════════════════════════════════════════

CREATE TABLE ai_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  message_id    UUID REFERENCES messages(id),
  stt_text      TEXT,                   -- Transcription vocale
  llm_response  TEXT,
  tts_url       TEXT,                   -- R2 URL du .ogg généré
  function_calls JSONB,
  confidence_score FLOAT,
  hitl_triggered BOOLEAN DEFAULT false,
  hitl_reason   TEXT,
  model_used    TEXT,                   -- gpt-4o|claude-3.5|llama-3
  latency_ms    INTEGER,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE flows (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  trigger_type  TEXT,                   -- message_received|order_created|order_shipped|scheduled
  nodes_json    JSONB NOT NULL,
  edges_json    JSONB NOT NULL,
  active        BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE flow_executions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id       UUID REFERENCES flows(id),
  contact_id    UUID REFERENCES contacts(id),
  current_node_id TEXT,
  state_json    JSONB,
  status        TEXT DEFAULT 'running',  -- running|completed|failed
  started_at    TIMESTAMPTZ DEFAULT now(),
  ended_at      TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════
-- CAMPAGNES
-- ═══════════════════════════════════════════════

CREATE TABLE campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  template_id   TEXT,
  audience_filter JSONB,
  status        TEXT DEFAULT 'draft',   -- draft|scheduled|running|completed|paused
  scheduled_at  TIMESTAMPTZ,
  sent_count    INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- BILLING & USAGE
-- ═══════════════════════════════════════════════

CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) UNIQUE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  plan          TEXT DEFAULT 'trial',
  status        TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false
);

CREATE TABLE usage_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,          -- conversation|ai_credit|broadcast|team_member
  quantity      INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════

-- Activer RLS sur toutes les tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- [idem pour toutes les tables]

-- Politique : chaque user ne voit que son tenant
CREATE POLICY tenant_isolation ON contacts
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- [Répéter pour chaque table]
```

---

### 5.2 Fonctions RPC Supabase

```sql
-- Vérifier quota plan
CREATE OR REPLACE FUNCTION check_plan_limit(p_tenant_id UUID, p_metric TEXT)
RETURNS JSONB AS $$
DECLARE
  v_plan TEXT;
  v_used INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT plan INTO v_plan FROM tenants WHERE id = p_tenant_id;
  SELECT COUNT(*) INTO v_used FROM usage_logs
  WHERE tenant_id = p_tenant_id AND type = p_metric
    AND created_at > date_trunc('month', now());
  -- [Limites selon plan]
  RETURN jsonb_build_object('allowed', v_used < v_limit, 'used', v_used, 'limit', v_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incrémenter usage
CREATE OR REPLACE FUNCTION increment_usage(p_tenant_id UUID, p_metric TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO usage_logs (tenant_id, type) VALUES (p_tenant_id, p_metric);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Plans & Pricing (adapté marché MENA)

```ts
// packages/shared/constants/planLimits.ts

export const PLAN_LIMITS = {
  trial: {
    label: 'Essai Gratuit',
    duration_days: 14,
    wa_numbers: 1,
    conversations_month: 100,
    ai_credits_month: 50,
    team_members: 1,
    broadcasts_month: 0,
    features: {
      voice_ai: false,
      flow_builder: false,
      multi_whatsapp: false,
      ecommerce_sync: true,
      kanban_crm: true,
      hitl: true,
      white_label: false,
    }
  },
  solo: {
    label: 'Agent Solo',
    price_mad_monthly: 690,
    price_mad_annual: 590,
    wa_numbers: 1,
    conversations_month: 300,
    ai_credits_month: 200,
    team_members: 1,
    broadcasts_month: 2,
    features: {
      voice_ai: true,
      flow_builder: false,
      multi_whatsapp: false,
      ecommerce_sync: true,
      kanban_crm: true,
      hitl: true,
      white_label: false,
    }
  },
  pro: {
    label: 'Machine de Vente',
    price_mad_monthly: 1490,
    price_mad_annual: 1270,
    wa_numbers: 3,
    conversations_month: 1000,
    ai_credits_month: 1000,
    team_members: 5,
    broadcasts_month: 10,
    features: {
      voice_ai: true,
      flow_builder: true,
      multi_whatsapp: true,
      ecommerce_sync: true,
      kanban_crm: true,
      hitl: true,
      white_label: false,
    }
  },
  agence: {
    label: 'Directeur Commercial',
    price_mad_monthly: 3490,
    price_mad_annual: 2970,
    wa_numbers: 5,
    conversations_month: 5000,
    ai_credits_month: -1,         // -1 = illimité
    team_members: -1,
    broadcasts_month: -1,
    features: {
      voice_ai: true,
      flow_builder: true,
      multi_whatsapp: true,
      ecommerce_sync: true,
      kanban_crm: true,
      hitl: true,
      white_label: true,
      dedicated_account_manager: true,
    }
  }
}
```

---

## 7. Infrastructure & Déploiement

### 7.1 Coolify — Configuration Services

Tous les services déployés sur **Coolify** (self-hosted sur VPS OVH/Contabo 8 vCPU, 32GB RAM).

```
Services Coolify :

1. pretalkme-web        ← apps/web Docker
   Port : 3000
   Domain : pretalkme.com (via Cloudflare Proxy)
   Build args : VITE_SUPABASE_URL, VITE_API_URL, VITE_WS_URL...

2. pretalkme-api        ← apps/api Docker
   Port : 4000
   Domain : api.pretalkme.com

3. pretalkme-ai         ← services/ai Docker
   Port : 8000
   Domain : ai.pretalkme.com (ou réseau interne Docker uniquement)

4. rabbitmq             ← Image officielle rabbitmq:3-management
   Port : 5672 (AMQP), 15672 (Admin)
   Réseau interne uniquement (pas exposé public)

5. redis                ← Image officielle redis:7-alpine
   Port : 6379
   Réseau interne uniquement

6. qdrant               ← Image officielle qdrant/qdrant (V AI RAG)
   Port : 6333
   Réseau interne uniquement
```

### 7.2 Cloudflare — Configuration

```
DNS Records :
  pretalkme.com         → Coolify IP (Proxied ✅)
  api.pretalkme.com     → Coolify IP (Proxied ✅)
  ai.pretalkme.com      → Coolify IP (Proxied ✅)

SSL : Cloudflare Universal SSL (automatique)
WAF : Activer règles de base (protection DDoS)
Cache : Pages statiques Astro cachées (Cache-Control: max-age=3600)
Workers (optionnel V2) : Rate limiting WhatsApp webhooks

Page Rules :
  /webhook/meta → Cache: Bypass (toujours passer au backend)
  /app/*        → Cache: Bypass (SPA dynamique)
  /              → Cache: Standard (landing page statique)
```

### 7.3 docker-compose.yml (Dev Local)

```yaml
version: '3.9'
services:
  web:
    build: ./apps/web
    ports: ["3000:3000"]
    env_file: ./apps/web/.env
    depends_on: [api]

  api:
    build: ./apps/api
    ports: ["4000:4000"]
    env_file: ./apps/api/.env
    depends_on: [redis, rabbitmq]

  ai:
    build: ./services/ai
    ports: ["8000:8000"]
    env_file: ./services/ai/.env
    depends_on: [rabbitmq, redis]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]
    environment:
      RABBITMQ_DEFAULT_USER: pretalkme
      RABBITMQ_DEFAULT_PASS: secret

  qdrant:
    image: qdrant/qdrant
    ports: ["6333:6333"]
    volumes: [qdrant_data:/qdrant/storage]

volumes:
  qdrant_data:
```

---

## 8. Sécurité & Conformité

### Authentification Cross-Service

```
Frontend (Astro/React)
  └── Supabase Auth → JWT (access_token)
      └── Injecté dans tous les headers HTTP → api.pretalkme.com
          Authorization: Bearer <supabase_access_token>
      └── Injecté dans Socket.io handshake
          io({ auth: { token: supabase_access_token } })

NestJS (apps/api)
  └── AuthGuard : vérifie JWT via supabase.auth.getUser(token)
  └── TenantGuard : extrait tenant_id du user_metadata Supabase
  └── RLS PostgreSQL : double sécurité côté DB

FastAPI (services/ai)
  └── Réseau Docker interne (pas exposé public)
  └── Header interne : X-Internal-Key (shared secret)
```

### Données Sensibles

- Tokens Meta WABA : stockés chiffrés AES-256 en Supabase
- Clés API IA (ElevenLabs, OpenAI) : variables env NestJS uniquement
- Audio voice notes clients : R2 avec URLs signées (TTL 1h)
- Anonymisation logs : numéros et contenus après 90 jours
- RGPD/CNDP : mention "Ce service utilise une IA" dans le premier message

### Rate Limiting

```ts
// NestJS : Throttler Guard
ThrottlerModule.forRoot([{
  name: 'webhook',
  ttl: 1000,
  limit: 100,   // 100 messages/sec max par tenant
}])
```

---

## 9. Plan de Livraison — Missions Ordonnées

### Phase 1 — Fondations (Semaines 1-3)
> Objectif : Infrastructure opérationnelle + auth + skeleton apps

| Mission | Projet | Responsable |
|---------|--------|-------------|
| Créer monorepo Turborepo + structure | Root | Dev Lead |
| Coolify : déployer Redis + RabbitMQ | Infra | Dev Lead |
| Cloudflare : DNS + SSL tous sous-domaines | Infra | Dev Lead |
| **PURGE pretalk** : supprimer Express, form builder, PDF, n8n | apps/web | Dev Frontend |
| Adapter Dockerfile apps/web (retirer Express) | apps/web | Dev Frontend |
| Créer apps/api NestJS (scaffold + modules vides) | apps/api | Dev Backend |
| Configurer Auth Guard NestJS (JWT Supabase) | apps/api | Dev Backend |
| Configurer Tenant Guard + RLS Supabase | apps/api + Supabase | Dev Backend |
| Créer schéma DB Supabase (toutes les tables) | Supabase | Dev Backend |
| Définir packages/shared/types | shared | Dev Lead |
| Créer services/ai FastAPI (scaffold vide) | services/ai | Dev IA |

### Phase 2 — Pipeline WhatsApp Core (Semaines 4-6)
> Objectif : Recevoir et envoyer des messages WhatsApp réels

| Mission | Projet | Responsable |
|---------|--------|-------------|
| Webhook Meta (réception + vérification HMAC) | apps/api | Dev Backend |
| Meta Embedded Signup (onboarding WABA) | apps/web | Dev Frontend |
| Publisher RabbitMQ `whatsapp.inbound` | apps/api | Dev Backend |
| Consumer `whatsapp.inbound` → save DB | apps/api | Dev Backend |
| Envoi messages texte Meta Graph API | apps/api | Dev Backend |
| WebSocket Gateway Socket.io (auth + rooms) | apps/api | Dev Backend |
| Page Inbox React (skeleton + Socket.io client) | apps/web | Dev Frontend |
| Liste conversations + chat bulles | apps/web | Dev Frontend |
| Envoi message manuel depuis inbox | apps/web + api | Dev Frontend |

### Phase 3 — Agent IA Textuel + Voice (Semaines 7-10)
> Objectif : L'IA répond automatiquement, avec voice notes

| Mission | Projet | Responsable |
|---------|--------|-------------|
| Publisher `ai.tasks` (NestJS → RabbitMQ) | apps/api | Dev Backend |
| FastAPI : consumer `ai.tasks` | services/ai | Dev IA |
| STT Faster-Whisper (Darija/AR/FR) | services/ai | Dev IA |
| LLM Router GPT-4o → Claude → Llama | services/ai | Dev IA |
| TTS ElevenLabs → FFmpeg → .ogg → R2 | services/ai | Dev IA |
| Consumer `ai.results` → envoi WhatsApp | apps/api | Dev Backend |
| HITL logic (confidence + sentiment + keywords) | services/ai | Dev IA |
| `transfer_to_human` → Socket.io notification | apps/api | Dev Backend |
| RAG Qdrant (embeddings produits + FAQ) | services/ai | Dev IA |
| Functions calling (check_stock, get_order, suggest) | services/ai | Dev IA |
| Player audio inline (wavesurfer.js) dans Inbox | apps/web | Dev Frontend |
| Page Config Agent IA + Simulateur | apps/web | Dev Frontend |
| Page Logs IA | apps/web | Dev Frontend |
| Bouton "Prendre la main" + "Repasser à l'IA" | apps/web + api | Dev Frontend |

### Phase 4 — CRM + E-Commerce (Semaines 11-13)
> Objectif : CRM complet + sync e-commerce opérationnelle

| Mission | Projet | Responsable |
|---------|--------|-------------|
| Page CRM contacts (table + Kanban pipeline) | apps/web | Dev Frontend |
| Fiche contact complète (historique, notes, commandes) | apps/web | Dev Frontend |
| API contacts (CRUD + tags + pipeline_stage) | apps/api | Dev Backend |
| YouCan API client + sync produits/commandes | apps/api | Dev Backend |
| Shopify API client + sync | apps/api | Dev Backend |
| WooCommerce REST client + sync | apps/api | Dev Backend |
| Page E-Commerce produits (table + stock badge) | apps/web | Dev Frontend |
| Page E-Commerce commandes (table + détail) | apps/web | Dev Frontend |
| Bouton "Envoyer update WhatsApp" (template) | apps/web + api | Dev Frontend |
| Webhook YouCan/Shopify (mise à jour auto stock) | apps/api | Dev Backend |

### Phase 5 — Flows + Campagnes (Semaines 14-16)
> Objectif : Automation no-code et broadcasts

| Mission | Projet | Responsable |
|---------|--------|-------------|
| Flow Builder canvas (reactflow) | apps/web | Dev Frontend |
| Implémentation de tous les types de Nodes | apps/web | Dev Frontend |
| Sauvegarde + chargement flows | apps/web + api | Dev Frontend |
| State machine Redis (flow_executions) | apps/api | Dev Backend |
| Exécuteur de flows (triggers + conditions) | apps/api | Dev Backend |
| Page Campagnes (création + audience filter) | apps/web | Dev Frontend |
| Moteur broadcast (queue + rate limiting Meta) | apps/api | Dev Backend |
| Stats campagnes temps réel | apps/web + api | Dev Full |

### Phase 6 — Billing + Onboarding + Marketing (Semaines 17-19)
> Objectif : Produit commercialisable

| Mission | Projet | Responsable |
|---------|--------|-------------|
| Intégration Stripe (subscriptions + webhooks) | apps/api | Dev Backend |
| Page Billing + portail Stripe | apps/web | Dev Frontend |
| Plan Guard NestJS (quotas + features) | apps/api | Dev Backend |
| Wizard Onboarding 4 étapes | apps/web | Dev Frontend |
| Landing page pretalkme.com (Astro refait) | apps/web | Dev Frontend |
| Pages verticales SEO (immobilier, e-commerce...) | apps/web | Dev Frontend |
| Page Pricing (plans en MAD) | apps/web | Dev Frontend |
| Dashboard Analytics + KPIs | apps/web + api | Dev Full |
| Gestion équipe (invitations, rôles) | apps/web + api | Dev Full |
| Tests E2E critiques (Playwright) | Root | Dev Lead |
| Monitoring (Sentry web + api) | Root | Dev Lead |

---

## 10. Cohérence Web ↔ API — Contrat d'Interface

### Règles de synchronisation

1. **Types partagés** : toute nouvelle entité définie dans `packages/shared/types/` avant d'être implémentée dans web ou api.
2. **Versioning API** : tous les endpoints préfixés `/api/v1/` dès le début — évite les breaking changes.
3. **Format erreurs API** : standard dans toute l'API NestJS :
```json
{
  "error": "PLAN_LIMIT_EXCEEDED",
  "message": "Vous avez atteint votre limite de 300 conversations ce mois-ci.",
  "metric": "conversations_month",
  "limit": 300,
  "used": 301
}
```
4. **Socket.io events** : nommage `resource.action` (ex: `message.new`, `conversation.updated`, `hitl.triggered`) — défini dans `packages/shared/constants/socketEvents.ts`.
5. **Feature flags** : toute feature gateée dans `packages/shared/constants/planLimits.ts` — jamais en dur dans web ou api.

---

*Document vivant — pretalkme Architecture v1.0 · Équipe technique pretalkme*
*Dernière mise à jour : 2026-04-09*
