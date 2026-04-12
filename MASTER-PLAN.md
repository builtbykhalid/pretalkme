# MASTER PLAN — État Réel & Feuille de Route pretalkme
> Document mis à jour le 2026-04-10 — Audit code + Analyse concurrentielle Leadr Space.
> **4 axes : CE QUI EST FAIT · CE QUI DOIT ÊTRE CORRIGÉ · CE QUI RESTE À FAIRE · GAPS CONCURRENTIELS**

---

## 🗂️ Table des matières

1. [Résumé Exécutif](#1-résumé-exécutif)
2. [CE QUI EST FAIT — Vrai état du code](#2-ce-qui-est-fait--vrai-état-du-code)
3. [CE QUI DOIT ÊTRE CORRIGÉ — Bugs & Dettes](#3-ce-qui-doit-être-corrigé--bugs--dettes)
4. [CE QUI RESTE À FAIRE — Agents à lancer](#4-ce-qui-reste-à-faire--agents-à-lancer)
5. [CE QUE LE PROPRIÉTAIRE DOIT FAIRE](#5-ce-que-le-propriétaire-doit-faire-khalid)
6. [Ordre d'exécution recommandé](#6-ordre-dexécution-recommandé)

---

## 1. Résumé Exécutif

| Couche | Statut | Score |
|--------|--------|-------|
| Monorepo & Structure | ✅ Complet | 100% |
| packages/shared (Types + Events) | ✅ Complet | 100% |
| Database Supabase (migrations locales) | ✅ Migrations créées, pas encore appliquées en prod | 70% |
| Frontend — Inbox (Agent 03) | ✅ Complet + Supabase Realtime | 95% |
| Frontend — Pages secondaires (Agent 04) | ✅ Pages créées, besoin de nettoyage | 85% |
| Backend NestJS — modules principaux | ⚠️ Partiel (4/11 modules implémentés) | 35% |
| Service IA FastAPI (Agent 07) | ⚠️ Skeleton créé, pas finalisé | 40% |
| Emails transactionnels (Agent 10) | ❌ Non commencé | 0% |
| Notifications in-app (Agent 11) | ❌ Stub vide | 0% |
| Infra Coolify / Cloudflare (Agent 09) | ❌ Non commencé | 0% |
| Landing Page (Agent 05) | 🔄 Différé (décision volontaire) | — |

**Priorité absolue :** Compléter le backend NestJS (modules manquants) avant tout déploiement.

---

## 2. CE QUI EST FAIT — Vrai état du code

### ✅ Phase 1 — Fondations

#### Monorepo Turborepo (Agent 01) — COMPLET
```
pretalkme/
├── apps/web/       ✅ Fork pretalk-hub adapté
├── apps/api/       ✅ NestJS scaffold complet
├── services/ai/    ✅ FastAPI skeleton + Dockerfile
├── packages/shared/ ✅ Types + constants + socketEvents compilés
└── docker-compose.yml ✅ Tous les services (web, api, ai, redis, rabbitmq, qdrant)
```

#### packages/shared — COMPLET
- ✅ Types : `Conversation`, `Message`, `Contact`, `Order`, `Product`, `AiRun`, `Tenant`, `Plan`
- ✅ `socketEvents.ts` — tous les events définis (`message.new`, `conversation.updated`, etc.)
- ✅ `planLimits.ts` — quotas Trial/Solo/Pro/Agence
- ✅ `hitlTriggers.ts` — conditions de transfert humain
- ✅ Package buildé et disponible en `dist/`

#### Database Supabase (Agent 08) — MIGRATIONS CRÉÉES
- ✅ 92 fichiers de migration dans `apps/web/supabase/migrations/`
- ✅ Schéma initial : tables `users`, `tenants`, `conversations`, `messages`, `contacts`, `orders`, `products`, `ai_runs`
- ✅ RLS + Triggers + policies créés
- ✅ Module AI agents (20000)
- ✅ Settings & Workflows (40000)
- ✅ Correctifs SQL dans `apps/web/docs/` (corrective_audit_supabase.sql, etc.)
- ⚠️ **Non encore appliqué sur un projet Supabase réel** (besoin du propriétaire)

---

### ✅ Phase 3 — Frontend (apps/web)

#### Dépendances installées — COMPLET
```json
✅ socket.io-client ^4.8.3
✅ zustand ^5.0.12
✅ axios ^1.15.0
✅ @dnd-kit/core ^6.3.1
✅ @dnd-kit/sortable ^10.0.0
✅ reactflow ^11.11.4
✅ wavesurfer.js ^7.12.5
✅ @supabase/supabase-js ^2.98.0
```

#### Agent 03 — UI Inbox — COMPLET (95%)
**Pages:**
- ✅ `pages/whatsapp/Inbox.tsx` — Page principale inbox
- ✅ `pages/whatsapp/` contient toutes les pages : AIAgent, AILogs, Analytics, Billing, CRM, Campaigns, ContactDetail, FlowBuilder, Onboarding, Orders, Products, Settings

**Composants inbox:**
- ✅ `components/inbox/ChatPanel.tsx`
- ✅ `components/inbox/ConversationList.tsx`
- ✅ `components/inbox/AudioPlayer.tsx`
- ✅ `components/inbox/ContactPanel.tsx`

**Hooks Supabase Realtime:**
- ✅ `hooks/useConversations.ts` — CDC Supabase temps réel
- ✅ `hooks/useMessages.ts` — CDC Supabase temps réel
- ✅ `hooks/useContacts.ts` — CRM + Kanban

**Socket.io:**
- ✅ `hooks/useSocket.ts` — Connexion complète vers apps/api avec tous les events
- ✅ `stores/useChatStore.ts` — Zustand store avec `addMessage`, `updateConversation`, `setTyping`, `markHITL`

**Context:**
- ✅ `context/AppContext.tsx` — Multi-tenant, supabase, agentRole, plan
- ✅ `context/AuthContext.tsx` — Supabase Auth
- ✅ `context/NotificationContext.tsx` — Notifications in-app

**Routes Astro:**
- ✅ `src/pages/whatsapp/index.astro` — Entry point SPA
- ✅ `src/pages/whatsapp/[...all].astro` — Catch-all pour React Router

#### Agent 04 — UI Pages Secondaires — QUASI COMPLET (85%)
Toutes les pages existent dans `pages/whatsapp/` :
- ✅ `CRM.tsx` — Contacts + Kanban pipeline (sauvegarde Supabase)
- ✅ `ContactDetail.tsx` — Fiche contact complète
- ✅ `Campaigns.tsx` — Gestion campagnes broadcast
- ✅ `FlowBuilder.tsx` — Automation drag-and-drop (reactflow)
- ✅ `Products.tsx` — Catalogue produits
- ✅ `Orders.tsx` — Suivi commandes
- ✅ `AIAgent.tsx` — Config agent IA (lié à table tenants Supabase)
- ✅ `AILogs.tsx` — Historique ai_runs
- ✅ `Analytics.tsx` — Dashboard KPIs
- ✅ `Settings.tsx` — Settings tenant
- ✅ `Billing.tsx` — Billing Stripe UI
- ✅ `Onboarding.tsx` — Wizard onboarding

---

### ⚠️ Phase 2 — Backend NestJS (apps/api) — PARTIEL

#### Modules IMPLÉMENTÉS (avec vraie logique) :
- ✅ `modules/whatsapp/` — webhook Meta, verification token (182 lignes)
- ✅ `modules/conversations/` — gateway Socket.io + service (101 lignes)
- ✅ `modules/billing/` — Stripe checkout + webhook (109 lignes)
- ✅ `modules/ecommerce/` — YouCan client + sync service

#### Infrastructure :
- ✅ `main.ts` — Socket.io adapter, CORS, ValidationPipe
- ✅ `infrastructure/supabase/` — Client Supabase service role
- ✅ `infrastructure/redis/` — Cache Redis
- ✅ `infrastructure/rabbitmq/` — Queue RabbitMQ
- ✅ `infrastructure/r2/` — Cloudflare R2 client
- ✅ `common/guards/`, `filters/`, `interceptors/`, `decorators/`

---

### ⚠️ Service IA FastAPI (services/ai) — SKELETON

- ✅ `main.py` — FastAPI app + RabbitMQ consumer (119 lignes)
- ✅ `pipeline/llm_router.py` — Routing GPT-4o / Claude / Llama (99 lignes)
- ✅ `pipeline/stt.py` — Faster-Whisper STT (47 lignes)
- ✅ `pipeline/tts.py` — ElevenLabs / XTTS TTS
- ✅ `utils/r2.py` — Upload Cloudflare R2
- ✅ `models/schemas.py` — Pydantic models
- ✅ `Dockerfile` + `requirements.txt`

---

## 3. CE QUI DOIT ÊTRE CORRIGÉ — Bugs & Dettes

### 🔧 CRITIQUE — À corriger en priorité

#### C1 — app.module.ts incomplet (Backend bloqué)
**Fichier :** `apps/api/src/app.module.ts`

Seuls 4 modules sont enregistrés. Les 7 autres existent mais sont des stubs vides (`index.ts` only) et **ne sont pas importés** :
```typescript
// MANQUANTS dans app.module.ts :
ContactsModule      ← stub vide
CampaignsModule     ← stub vide
NotificationsModule ← stub vide
FlowsModule         ← stub vide
AiModule            ← stub vide
TenantsModule       ← stub vide
AuthModule          ← stub vide (guard jwt sans module)
// EmailModule      ← n'existe pas du tout
```
**Action :** Implémenter ces modules (voir section 4) puis les enregistrer dans app.module.ts.

#### C2 — CORS en production non configuré
**Fichier :** `apps/api/src/main.ts` ligne 10
```typescript
origin: '*', // For dev. Should be process.env.CORS_ORIGIN in prod.
```
**Action :** Changer avant déploiement prod :
```typescript
origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
```

#### C3 — Fichiers legacy pretalk dans pages/ (pollue le routing)
**Dossier :** `apps/web/src/components/ReactApp/pages/`

Ces fichiers pretalk ne servent plus à rien dans le contexte pretalkme mais restent dans le repo :
```
Agents.tsx, Automations.tsx, AvailabilitiesPage.tsx, ConsultationPage.tsx,
Dashboard.tsx, Finances.tsx, Home.tsx, HomePage.tsx, HomeSEO.tsx,
LeadReview.tsx, Leads.tsx, PricingPage.tsx, PublicAudit.tsx, PublicForm.tsx,
PublicProfile.tsx, Services.tsx, Statistics.tsx, Templates.tsx
+ *.backup, *.bak2, *.bak3 files
```
**Action :** Vérifier lesquels sont référencés dans le router React, puis supprimer les inutilisés.

#### C4 — Lib/ contient des fichiers pretalk inutiles
**Dossier :** `apps/web/src/components/ReactApp/lib/`
```
emailApi.ts    ← API pretalk (à supprimer)
leadActions.ts ← Leads pretalk (à supprimer)
leadStatuses.ts ← Leads pretalk (à supprimer)
pdfApi.ts      ← PDF pretalk (à supprimer)
auditLanding.ts ← Audit pretalk (à supprimer ou adapter)
```
`supabase.ts` et `publicApi.ts` → À CONSERVER et adapter.

#### C5 — Composants legacy toujours présents
**Dossiers :**
- `components/ReactApp/components/forms/` → ne contient que `FormFloatingBar.tsx` (vérifier si référencé)
- `components/ReactApp/components/booking/` → composants booking pretalk (vérifier si référencés)

#### C6 — SYNC-GUIDE.md non mis à jour
**Fichier :** `apps/web/docs/Project Builder Agents/SYNC-GUIDE.md`

La table d'avancement (Section 7) indique encore "⏳ À faire" pour les prompts 02, 03, 04 alors qu'ils sont en grande partie terminés. **Mettre à jour après chaque mission.**

---

### 🔧 IMPORTANT — À corriger avant prod

#### C7 — Variables d'environnement manquantes
**Fichiers :** `.env.local` (web) et `.env` (api) non créés (normaux pour git, mais à configurer).
- Le propriétaire doit créer ces fichiers (voir Section 5).

#### C8 — Supabase migrations pas appliquées en prod
92 migrations locales existent mais aucun projet Supabase cloud n'est configuré.
- Le propriétaire doit créer le projet et appliquer les migrations (voir Section 5).

#### C9 — docker-compose.yml manque le volume `qdrant_data`
**Fichier :** `docker-compose.yml`
Le volume `qdrant_data` est référencé dans les services mais la déclaration `volumes:` en bas du fichier est incomplète (vérifié).

#### C10 — infra/ folder manquant
Le plan prévoit `infra/docker-compose.prod.yml` mais ce dossier n'existe pas.
- À créer pour le déploiement Coolify (voir Section 4, Agent 09).

---

## 4. CE QUI RESTE À FAIRE — Agents à lancer

### 🔴 PRIORITÉ 1 — Backend NestJS (bloque tout)

#### Agent 06-B : Compléter les modules NestJS manquants
> **Travail dans `apps/api/src/modules/`**

Modules à implémenter from scratch (actuellement juste `index.ts`) :

**a) ContactsModule**
```
contacts.module.ts
contacts.controller.ts  ← GET /api/v1/contacts, GET /:id, PATCH /:id
contacts.service.ts     ← CRUD Supabase + filtres pipeline_stage/tags
```

**b) CampaignsModule**
```
campaigns.module.ts
campaigns.controller.ts  ← GET/POST /api/v1/campaigns
campaigns.service.ts     ← Gestion campagnes broadcast WhatsApp
```

**c) NotificationsModule** (Agent 11)
```
notifications.module.ts
notifications.controller.ts  ← GET /notifications, PATCH /:id/read, PATCH /read-all
notifications.service.ts     ← CRUD Supabase + emit Socket.io
```

**d) FlowsModule**
```
flows.module.ts
flows.controller.ts  ← GET/POST/PUT /api/v1/flows
flows.service.ts     ← Sauvegarde/exécution flow JSON
```

**e) AiModule**
```
ai.module.ts
ai.controller.ts  ← GET/PATCH /api/v1/ai/config, POST /simulate, GET /logs
ai.service.ts     ← Config tenant + publier sur RabbitMQ ai.tasks + lire ai.results
```

**f) TenantsModule**
```
tenants.module.ts
tenants.controller.ts  ← GET /api/v1/settings/team, POST /invite, DELETE /:id
tenants.service.ts     ← Gestion membres + intégrations
```

**g) AuthModule** (guard JWT Supabase)
```
auth.module.ts
jwt.guard.ts     ← Valider le JWT Supabase sur toutes les routes protégées
```

**h) EmailModule** (Agent 10)
```
email/
├── email.module.ts
├── email.service.ts      ← Resend SDK
└── templates/
    ├── invitation.ts
    ├── hitl-alert.ts
    ├── quota-warning.ts
    └── subscription.ts
```

**Après chaque module :** l'enregistrer dans `app.module.ts`.

---

### 🔴 PRIORITÉ 2 — Compléter Service IA (Agent 07)

Le skeleton existe, mais il faut vérifier et compléter :

- [ ] `pipeline/stt.py` — Faster-Whisper : téléchargement audio depuis R2, transcription, fallback Whisper API
- [ ] `pipeline/llm_router.py` — Context RAG depuis Qdrant, function calling (check_stock, get_order), HITL detection
- [ ] `pipeline/tts.py` — ElevenLabs → .ogg via FFmpeg, upload R2
- [ ] `main.py` — Consumer RabbitMQ `ai.tasks`, publisher `ai.results` complet avec tous les champs du SYNC-GUIDE
- [ ] Qdrant integration (vector store pour RAG) — actuellement absent des fichiers existants

---

### 🟡 PRIORITÉ 3 — Nettoyage Frontend (Agent 02 restant)

- [ ] Supprimer les pages legacy pretalk listées en C3
- [ ] Supprimer `lib/emailApi.ts`, `lib/leadActions.ts`, `lib/leadStatuses.ts`, `lib/pdfApi.ts`
- [ ] Vérifier et nettoyer le router React principal pour retirer les routes pretalk
- [ ] Supprimer les fichiers `.backup`, `.bak2`, `.bak3`
- [ ] Vérifier `components/forms/` et `components/booking/` — supprimer si non référencés

---

### 🟡 PRIORITÉ 4 — Infra Coolify/Cloudflare (Agent 09)

- [ ] Créer `infra/` avec `docker-compose.prod.yml`
- [ ] Configuration Coolify : 3 services (web, api, ai) + Redis + RabbitMQ + Qdrant
- [ ] DNS Cloudflare : `app.pretalk.me` → web, `api.pretalk.me` → api, `ai.pretalk.me` → ai
- [ ] Cloudflare R2 bucket `pretalk-media` + CORS policy
- [ ] SSL auto via Coolify/Cloudflare proxy
- [ ] Variables d'env en prod via Coolify secrets

---

### 🟢 PRIORITÉ 5 — Pages statiques / SEO (Agent 05 — Différé)

**Décision déjà prise :** Ne pas faire maintenant.
Quand activé : créer `pretalk.me/whatsapp-ai-agents` (une seule page Astro légère).

---

## 5. CE QUE LE PROPRIÉTAIRE DOIT FAIRE (Khalid)

> Ces actions **ne peuvent pas être déléguées à un agent IA** — elles nécessitent vos accès, comptes et décisions business.

### 🔑 IMMÉDIAT — Avant que les agents puissent tester

#### S1 — Créer le projet Supabase
1. Aller sur [supabase.com](https://supabase.com) → New Project
2. Région : choisir EU (Frankfurt) pour MENA latency
3. Récupérer : `Project URL`, `anon key`, `service_role key`
4. Appliquer les migrations : dans Supabase Dashboard → SQL Editor, exécuter les fichiers dans `apps/web/supabase/migrations/` dans l'ordre
5. Appliquer aussi `docs/corrective_audit_supabase.sql` et les autres correctifs

#### S2 — Créer les fichiers .env (copier et remplir)
```bash
# apps/web/.env.local
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000

# apps/api/.env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RABBITMQ_URL=amqp://pretalkme:secret_local@localhost:5672
REDIS_URL=redis://localhost:6379
META_APP_SECRET=         ← depuis Meta Developer Portal
META_VERIFY_TOKEN=       ← inventer un token secret
META_GRAPH_API_VERSION=v19.0
R2_ENDPOINT=             ← depuis Cloudflare
R2_ACCESS_KEY=           ← depuis Cloudflare
R2_SECRET_KEY=           ← depuis Cloudflare
R2_BUCKET=pretalk-media
R2_PUBLIC_URL=https://media.pretalk.me
STRIPE_SECRET_KEY=sk_...  ← depuis dashboard Stripe
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...     ← depuis resend.com
CORS_ORIGIN=http://localhost:3000
PORT=4000

# services/ai/.env
RABBITMQ_URL=amqp://pretalkme:secret_local@localhost:5672
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...     ← OpenAI
ANTHROPIC_API_KEY=sk-ant-... ← Anthropic (optionnel)
ELEVENLABS_API_KEY=       ← ElevenLabs
R2_ENDPOINT=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=pretalk-media
QDRANT_URL=http://localhost:6333
PORT=8000
```

#### S3 — Configurer Meta WhatsApp Business API
1. Meta Developer Portal → Business App
2. Activer WhatsApp Product
3. Créer un numéro de test
4. Configurer le webhook : `https://api.pretalk.me/webhook/meta`
5. Récupérer `META_APP_SECRET` et définir `META_VERIFY_TOKEN`

#### S4 — Compte Stripe
1. Créer les produits Stripe correspondant aux plans (Trial, Solo 690 MAD, Pro 1490 MAD, Agence 3490 MAD)
2. Récupérer `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`
3. Configurer le webhook Stripe vers `https://api.pretalk.me/billing/webhook`

#### S5 — Compte Resend (emails)
1. Aller sur [resend.com](https://resend.com) → créer compte
2. Vérifier le domaine `pretalk.me` (ajouter records DNS dans Cloudflare)
3. Récupérer `RESEND_API_KEY`

#### S6 — Compte ElevenLabs (TTS voix arabe/darija)
1. Aller sur [elevenlabs.io](https://elevenlabs.io) → créer compte
2. Choisir une voix Darija/Arabic
3. Récupérer `ELEVENLABS_API_KEY`

### 🖥️ DÉPLOIEMENT — Quand le code est prêt

#### S7 — Serveur Coolify
1. Acheter un VPS (recommandé : Hetzner CX31, ~€15/mois, 4 vCPU, 8GB RAM)
2. Installer Coolify : `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
3. Créer 3 applications dans Coolify (web, api, ai)
4. Ajouter les secrets d'environnement dans Coolify
5. Configurer Coolify pour pointer sur votre repo GitHub

#### S8 — Cloudflare
1. Si pas encore fait : transférer `pretalk.me` vers Cloudflare (ou ajouter comme zone)
2. Créer le bucket R2 `pretalk-media`
3. Configurer CORS sur R2 pour autoriser `app.pretalk.me`
4. Créer les DNS records :
   - `app.pretalk.me` → IP serveur Coolify
   - `api.pretalk.me` → IP serveur Coolify
   - `ai.pretalk.me` → IP serveur Coolify (interne si possible)
   - `media.pretalk.me` → R2 public URL

---

## 6. Ordre d'exécution recommandé

```
MAINTENANT (bloquant)
  └── S1 : Créer projet Supabase + appliquer migrations          [Khalid]
  └── S2 : Créer les .env avec les vraies clés                   [Khalid]
  └── Agent 06-B : Implémenter les 7 modules NestJS manquants    [Agent IA]

SEMAINE 1
  └── Agent 10 : EmailModule (Resend) dans apps/api              [Agent IA]
  └── Agent 11 : NotificationsModule complet dans apps/api       [Agent IA]
  └── Agent 02-B : Nettoyage pages/lib legacy pretalk (web)      [Agent IA]

SEMAINE 2
  └── Agent 07-B : Compléter pipeline IA (Qdrant RAG + TTS .ogg) [Agent IA]
  └── S3/S4/S5/S6 : Créer comptes Meta, Stripe, Resend, ElevenLabs [Khalid]
  └── Tests d'intégration frontend ↔ backend                     [Agent IA]

SEMAINE 3
  └── Agent 09 : Infra Coolify + DNS Cloudflare                  [Agent IA]
  └── S7/S8 : Acheter VPS + configurer Coolify + R2              [Khalid]
  └── Déploiement staging → test end-to-end                      [Khalid + Agent]

APRÈS VALIDATION STAGING
  └── Déploiement production                                      [Khalid]
  └── Agent 05 : Simple landing page pretalk.me/whatsapp-ai-agents [Agent IA]
```

---

## 7. ANALYSE CONCURRENTIELLE — Leadr Space vs pretalkme

> Basé sur les screenshots du concurrent analysés le 2026-04-10.
> **Ce que le concurrent a déjà en production que nous n'avons PAS encore.**

---

### 7.1 Tableau comparatif complet

| Fonctionnalité | Leadr Space | pretalkme | Action requise |
|----------------|-------------|-----------|----------------|
| **Dashboard** landing page avec KPIs | ✅ | ❌ | À créer |
| **QR Code** WhatsApp Business sur Dashboard | ✅ | ❌ | À créer |
| **Statut connexion** WA dans header (badge + numéro) | ✅ | ❌ | À ajouter |
| **Infos compte WA** (TIER, Quality Rating, status) | ✅ | ❌ | À créer |
| **Templates** WA — module dédié | ✅ | ❌ | À créer |
| **Campaign Analytics** — Sent/Delivered/Read/Failed % | ✅ | ❌ | À ajouter |
| **Campaign** — Aperçu message WhatsApp rendu | ✅ | ❌ | À ajouter |
| **Campaign** — Export CSV destinataires + statuts | ✅ | ❌ | À ajouter |
| **Campaign** — Retries par destinataire | ✅ | ❌ | À ajouter |
| **Flow** — Trigger mot-clé (Contains/Exact/Fuzzy) | ✅ | ❌ | À ajouter |
| **Flow** — Noeud Interactive Buttons (Header/Body/CTA) | ✅ | ❌ | À ajouter |
| **Flow** — Noeud Interactive List | ✅ | ❌ | À ajouter |
| **Flow** — Noeud Template WA | ✅ | ❌ | À ajouter |
| **Flow** — Actions Tags (Add/Remove) | ✅ | ❌ | À ajouter |
| **Flow** — Actions Pipeline/Funnel | ✅ | ❌ | À ajouter |
| **Flow** — "No Reply Within" follow-up | ✅ | ❌ | À ajouter |
| **Flow** — Publier / Dépublier un flow | ✅ | ❌ | À ajouter |
| **Flow** — Panneau latéral d'actions (searchable) | ✅ | ❌ | À améliorer |
| **Developer Tools** (API keys, Webhooks) | ✅ | ❌ | À créer |
| **Google Sheets** — sync e-commerce | ❌ | ❌ | AVANTAGE COMPÉTITIF à créer |
| **Flow via prompt IA** — générer un flow en langage naturel | ❌ | ❌ | AVANTAGE COMPÉTITIF à créer |
| Inbox WhatsApp Web clone | ✅ | ✅ | OK |
| CRM / Pipelines contacts | ✅ | ✅ | OK |
| Campagnes broadcast | ✅ | ✅ | OK (à enrichir) |
| Agent IA vocal (STT/TTS) | ❌ | ✅ | **NOTRE DIFFÉRENCIATEUR** |
| E-Commerce YouCan/Shopify | ❌ | ✅ | **NOTRE DIFFÉRENCIATEUR** |

---

### 7.2 Détail des GAPs — Ce qu'il faut construire

#### GAP-1 : Page Dashboard (page d'accueil de l'app)
**Problème :** Notre app redirige vers `/whatsapp/inbox`. Il n'y a pas de vraie page dashboard.
**Ce que le concurrent montre :**
- Carte "WhatsApp Account" avec : nom boutique, numéro connecté, TIER (TIER_10K), quality rating, number status (CONNECTED), account status (APPROVED)
- **QR Code** du compte WhatsApp Business (généré depuis Meta Graph API)
- 3 compteurs KPI : Contacts total, Campagnes total, Messages total
- Graphe Inbound rate vs Outbound rate sur 7 jours
- Section campagnes récentes en bas

**Plan d'action :**
```
1. Créer pages/whatsapp/Dashboard.tsx (nouvelle page)
2. Ajouter route /whatsapp/ → Dashboard (au lieu de redirect inbox)
3. Ajouter dans Sidebar un item "Dashboard" en premier
4. Composants à créer :
   - <WhatsAppAccountCard /> — QR code + statut connexion
   - <KpiCounters />         — Contacts, Campaigns, Messages
   - <MessageRateChart />    — Recharts, inbound/outbound
   - <RecentCampaigns />     — 3 dernières campagnes
5. Backend API à ajouter :
   GET /api/v1/dashboard/stats → { totalContacts, totalCampaigns, totalMessages }
   GET /api/v1/whatsapp/account → { displayName, phoneNumber, tier, qualityRating, numberStatus, accountStatus, qrCodeUrl }
```

**QR Code :** Le QR code affiché par le concurrent est le QR code WhatsApp Business de Meta. Il s'obtient via l'API Meta :
```
GET https://graph.facebook.com/v19.0/{phone-number-id}/qr_codes
```
Il permet aux clients de scanner et démarrer une conversation directement.

---

#### GAP-2 : Statut WhatsApp dans le Header
**Problème :** Notre header ne montre pas si le numéro WhatsApp est connecté ou non.
**Ce que le concurrent montre :** Badge "+212 708-234959 CONNECTED" en haut à droite.

**Plan d'action :**
```
1. Modifier Header.tsx — ajouter <WhatsAppStatusBadge />
2. Le badge affiche : numéro WA du tenant + pill verte "CONNECTED" / rouge "DISCONNECTED"
3. Données viennent de AppContext (refreshées au login)
```

---

#### GAP-3 : Module Templates WhatsApp
**Problème :** Nous n'avons pas de gestion des templates Meta WhatsApp (HSM — Highly Structured Messages).
**Ce que le concurrent montre :** Nav item "Templates" dédié.

**Les templates WA sont obligatoires pour :**
- Campagnes broadcast (on ne peut pas envoyer de message libre en masse)
- Premiers messages vers un contact (24h window fermée)

**Plan d'action :**
```
1. Créer pages/whatsapp/Templates.tsx
2. Ajouter route /whatsapp/templates et nav item dans Sidebar
3. Interface :
   - Liste des templates approuvés (synchronisés depuis Meta Graph API)
   - Bouton "Créer nouveau template" → formulaire Header/Body/Footer/Buttons
   - Statut : PENDING / APPROVED / REJECTED (vient de Meta)
   - Catégories : MARKETING / UTILITY / AUTHENTICATION
4. Backend :
   GET  /api/v1/templates           → liste depuis Meta Graph API
   POST /api/v1/templates           → soumettre template pour approbation Meta
   DELETE /api/v1/templates/:id     → supprimer template
5. Intégrer dans Campaigns — picker de template au lieu de texte libre
```

---

#### GAP-4 : Campaign Analytics détaillées
**Problème :** Notre page Campaigns affiche une liste de campagnes mais sans analytics par campagne.
**Ce que le concurrent montre :** Page de détail avec Sent/Delivered/Read/Failed%, preview message, CSV export, liste destinataires avec retries.

**Plan d'action :**
```
1. Créer pages/whatsapp/CampaignDetail.tsx
2. Ajouter route /whatsapp/campaigns/:id
3. Sections :
   - KPI cards : Messages, Sent %, Delivered %, Read %, Failed %
   - Campaign info : nom, template utilisé, liste destinataires, heure envoi
   - Preview message WhatsApp (rendu réaliste à droite)
   - Export CSV (liste contacts + Phone + Status + Retries)
   - Tableau destinataires : Contact | Phone | Last Updated | Retries | Status
4. Backend :
   GET /api/v1/campaigns/:id/stats     → { sent, delivered, read, failed, total }
   GET /api/v1/campaigns/:id/recipients → liste paginée avec statuts
   GET /api/v1/campaigns/:id/export    → CSV download
```

---

#### GAP-5 : Flow Builder — Enrichissement des noeuds
**Problème :** Notre FlowBuilder a les noeuds de base (Trigger, Message, Condition, Wait, HITL, Stock) mais manque de nombreux types de noeuds du concurrent.

**Ce que le concurrent montre dans son panneau latéral :**

```
Messages
  ├── Simple text          ← on a déjà
  ├── Media files          ← manque
  ├── Interactive buttons  ← MANQUE (crucial pour ventes)
  ├── Interactive list     ← manque
  └── Template             ← manque (lié au GAP-3)

Group Actions
  ├── Add to group         ← manque
  └── Remove from Group    ← manque

Contact
  └── Update Contact       ← manque

Tag
  ├── Add Tags             ← MANQUE (crucial pour CRM)
  └── Remove Tags          ← manque

Funnel
  ├── Add/Edit to Pipeline ← MANQUE (crucial pour CRM)
  └── Remove from Pipeline ← manque
```

**Trigger enrichi :**
```
Trigger : Text contains specific keywords
  ├── Search in color post content (toggle)
  ├── Matching Type : Contains / Exact matching / Fuzzy matching
  └── Trigger keywords : multi-tag input
```

**Fonctionnalités flow manquantes :**
- "No Reply Within X minutes" follow-up node
- Publier / Dépublier un flow (statut `published` en DB)
- Panneau latéral searchable d'actions

**Plan d'action :**
```
1. Dans FlowBuilder.tsx, ajouter les custom nodes :
   - MediaNode          ← envoyer image/video/document
   - InteractiveButtonsNode ← bouttons interactifs WA (Header/Body/Footer/CTA)
   - InteractiveListNode    ← liste menu WA
   - TemplateNode           ← sélectionner un template approuvé
   - TagActionNode          ← add/remove tags contact
   - PipelineActionNode     ← move contact in pipeline
   - NoReplyNode            ← "Si pas de réponse dans X min, faire..."
2. Enrichir TriggerNode :
   - Ajouter dropdown matching type
   - Ajouter champ multi-tag pour les mots-clés
3. Ajouter panneau latéral droit avec actions groupées + search
4. Ajouter bouton "Publier" (met `published: true` en DB)
5. Backend : PATCH /api/v1/flows/:id/publish
```

---

#### GAP-6 : Developer Tools
**Problème :** Pas de section pour gérer les clés API et webhooks sortants du tenant.
**Ce que le concurrent montre :** Item "Developer Tools" dans le menu.

**Plan d'action :**
```
1. Créer pages/whatsapp/DeveloperTools.tsx
2. Sections :
   - API Key du tenant (pour intégrations tierces)
   - Webhooks sortants (URL + events à écouter)
   - Logs des appels webhook
3. Backend :
   GET  /api/v1/developer/api-key    → clé API du tenant
   POST /api/v1/developer/api-key/rotate → rotation clé
   GET/POST /api/v1/developer/webhooks  → CRUD webhooks
```

---

### 7.3 AVANTAGES COMPÉTITIFS — Ce que NOUS devons avoir et que le concurrent n'a pas

#### AVANTAGE-1 : Google Sheets comme source e-commerce
**Pourquoi :** Beaucoup de commerçants MENA gèrent leur catalogue dans Google Sheets, sans plateforme e-commerce.
**Ce qu'il faut construire :**
```
Settings > Intégrations > "Google Sheets (Catalogue)"
  ├── Bouton "Connecter Google Account" (OAuth2)
  ├── Saisir l'URL du Google Sheet
  ├── Mapper les colonnes : Produit | Prix | Stock | SKU | Image
  └── Sync automatique toutes les X heures (ou manuel)

Backend :
  POST /api/v1/integrations/google-sheets/connect  → OAuth flow
  POST /api/v1/integrations/google-sheets/sync     → importer produits → table products
  GET  /api/v1/integrations/google-sheets/preview  → aperçu avant import

Côté IA : l'agent peut check_stock depuis la table products (même source que YouCan)
```

**Onboarding :** Ajouter "Google Sheets" comme option dans StepEcommerce (à côté de YouCan/Shopify/WooCommerce/Saisie Manuelle).

#### AVANTAGE-2 : Génération de Flow via prompt IA
**Pourquoi :** Différenciateur fort — le concurrent n'a pas ça. Permet aux non-techniciens de créer des flows complexes.
**Ce qu'il faut construire :**
```
Dans FlowBuilder, ajouter un bouton "Générer avec l'IA ✨"
  → Ouvre un modal avec un textarea
  → L'utilisateur tape en langage naturel :
    "Quand un client envoie 'bonjour', réponds avec un message de bienvenue,
     demande son numéro de commande, vérifie le stock, et si stock < 5,
     transfère à un agent humain."
  → L'IA génère les noeuds ReactFlow correspondants
  → L'utilisateur peut les ajuster visuellement après

Backend :
  POST /api/v1/ai/generate-flow
    body: { prompt: string }
    returns: { nodes: Node[], edges: Edge[] }  ← format ReactFlow
  
Implémentation IA : appel GPT-4o avec system prompt spécifique + JSON schema des noeuds
```

---

### 7.4 Plan de correction frontend — ce qui doit changer MAINTENANT

#### Sidebar.tsx — Ajouter les items manquants
**Fichier :** `apps/web/src/components/ReactApp/components/layout/Sidebar.tsx`

```typescript
// Ordre actuel → Ordre cible
const navItems = [
  { id: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard, path: '/' },       // NOUVEAU
  { id: 'inbox',       label: 'Chats',        icon: MessageSquare,   path: '/inbox' },
  { id: 'crm',         label: 'Contacts',     icon: Users,           path: '/crm' },
  { id: 'campaigns',   label: 'Campagnes',    icon: Megaphone,       path: '/campaigns' },
  { id: 'templates',   label: 'Templates',    icon: FileText,        path: '/templates' }, // NOUVEAU
  { id: 'flows',       label: 'Automations',  icon: GitBranch,       path: '/flows' },
  { id: 'ecommerce',   label: 'E-Commerce',   icon: ShoppingBag,     path: '/ecommerce/products' },
  { id: 'ai-agent',    label: 'Agent IA',     icon: Bot,             path: '/ai-agent' },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart2,       path: '/analytics' },
  { id: 'settings',    label: 'Paramètres',   icon: Settings,        path: '/settings' },
  { id: 'developer',   label: 'Developer',    icon: Code,            path: '/developer' }, // NOUVEAU
];
```

#### Routes à ajouter dans le router React
```typescript
// Nouvelles routes à ajouter :
/whatsapp/                    → Dashboard.tsx (NEW — remplace redirect vers inbox)
/whatsapp/templates           → Templates.tsx (NEW)
/whatsapp/campaigns/:id       → CampaignDetail.tsx (NEW)
/whatsapp/developer           → DeveloperTools.tsx (NEW)
```

---

### 7.5 Priorités des GAPs (ordre d'urgence)

| Priorité | GAP | Impact | Effort |
|----------|-----|--------|--------|
| 🔴 P1 | GAP-1 : Dashboard + QR Code + Status header | Très élevé | Moyen |
| 🔴 P1 | GAP-3 : Templates WA | Bloquant pour campagnes | Élevé |
| 🟡 P2 | GAP-4 : Campaign Analytics | Élevé | Moyen |
| 🟡 P2 | GAP-5 : FlowBuilder enrichissement | Élevé | Élevé |
| 🟢 P3 | AVANTAGE-1 : Google Sheets | Différenciateur | Moyen |
| 🟢 P3 | AVANTAGE-2 : Flow via prompt IA | Différenciateur fort | Moyen |
| 🔵 P4 | GAP-6 : Developer Tools | Moyen | Faible |
| 🔵 P4 | GAP-2 : Header status badge | Cosmétique | Faible |

---

## Annexe — Fichiers de référence clés

| Fichier | Rôle |
|---------|------|
| [SYNC-GUIDE.md](apps/web/docs/Project%20Builder%20Agents/SYNC-GUIDE.md) | Interfaces entre projets (API, Socket, RabbitMQ) |
| [00-context-global.md](apps/web/docs/Project%20Builder%20Agents/00-context-global.md) | Contexte CTO — à joindre à chaque session agent |
| [08-database-supabase.md](apps/web/docs/Project%20Builder%20Agents/08-database-supabase.md) | Spec complète du schéma DB |
| [06-api-backend-nestjs.md](apps/web/docs/Project%20Builder%20Agents/06-api-backend-nestjs.md) | Spec complète du backend NestJS |
| [achievement.md](apps/web/docs/Project%20Builder%20Agents/achievement.md) | Résumé de ce qui a été accompli (Phase 1 UI) |
| `packages/shared/dist/` | Types compilés — source de vérité pour web ↔ api |

---

*Dernière mise à jour : 2026-04-09 | Auteur audit : Claude Code*
