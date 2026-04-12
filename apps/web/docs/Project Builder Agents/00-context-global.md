# CONTEXTE GLOBAL & RÔLE CTO — pretalkme WhatsApp IA
> **Ce fichier est le document maître de coordination.**
> À inclure EN TÊTE de chaque session agent, sans exception.
> Chaque agent doit lire ce fichier avant de commencer sa mission.

---

## Rôle de ce document (CTO Coordination)

Ce fichier joue le rôle de **CTO virtuel** : il donne à chaque agent le contexte complet du projet, la vision d'ensemble, les règles à respecter, et les dépendances entre projets.

**Règle fondamentale :** Chaque agent qui modifie une interface (API, event Socket.io, type partagé, variable d'env) **doit mettre à jour `SYNC-GUIDE.md`** avant de terminer sa session.

---

## Qu'est-ce que pretalkme WhatsApp IA ?

**pretalkme** est une fonctionnalité SaaS multi-tenant intégrée dans l'écosystème pretalk.me, dédiée aux e-commerçants MENA (Maroc en priorité). Elle combine :
- CRM WhatsApp collaboratif multi-agents
- Agent IA vocal (reçoit voice notes → STT → LLM → TTS → renvoie .ogg sur WhatsApp)
- Intégration e-commerce native (YouCan, Shopify, WooCommerce)
- Flow Builder automation drag-and-drop
- Human-in-the-Loop (HITL) auditable
- Notifications temps réel (in-app + email)

---

## URLs — CRITIQUE

```
App (dashboard) :    https://app.pretalk.me/whatsapp
API Backend :        https://api.pretalk.me
Service IA :         https://ai.pretalk.me  (ou réseau interne Docker)
Médias/Audio :       https://media.pretalk.me  (Cloudflare R2)
Landing page :       https://pretalk.me/whatsapp-ai-agents  (simple, fait plus tard)
```

**Important :** Le produit vit sous le domaine `pretalk.me` existant — PAS un nouveau domaine.
- Le frontend est le repo `pretalk-hub` existant, modifié pour accueillir `/whatsapp/*`
- L'API est un nouveau service NestJS sur `api.pretalk.me`
- Toutes les routes React commencent par `/whatsapp/` (pas `/app/`)

---

## Origine du projet

**apps/web** est une adaptation du repo `pretalk-hub` (Astro + React + Supabase).
- On garde : design system, auth Supabase, routing React SPA, Docker, pages existantes pretalk
- On supprime uniquement : Express server, form builder pretalk, PDF, n8n
- On ajoute : section `/whatsapp/*` montée dans Astro, Socket.io, Zustand

**apps/api** est un **nouveau projet NestJS** créé from scratch, déployé séparément.

**IMPORTANT :** On ne touche PAS aux pages marketing/SEO existantes de pretalk.me pour l'instant.
Une simple page `pretalk.me/whatsapp-ai-agents` sera créée ultérieurement.

---

## Structure Monorepo (Turborepo)

```
pretalkme/
├── apps/
│   ├── web/          ← Fork pretalk-hub (Astro 5 + React 19) — route /whatsapp/*
│   └── api/          ← NestJS (nouveau) — api.pretalk.me
├── services/
│   └── ai/           ← FastAPI Python (STT + LLM + TTS) — ai.pretalk.me
└── packages/
    └── shared/       ← Types TS + planLimits + socketEvents partagés
```

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Astro 5 + React 19 + TypeScript |
| State | Zustand |
| Styling | Tailwind CSS + ShadCN/ui + Framer Motion |
| Temps réel | Socket.io client |
| Backend | NestJS + Socket.io server |
| Auth | Supabase Auth (JWT) |
| Database | Supabase PostgreSQL + RLS |
| Queue | RabbitMQ |
| Cache | Redis |
| Emails | Resend (transactionnel) |
| Notifications | In-app (Socket.io) + Email (Resend) |
| IA STT | Faster-Whisper |
| IA LLM | GPT-4o → Claude 3.5 → Llama 3 |
| IA TTS | ElevenLabs / XTTS + FFmpeg → .ogg |
| Vector DB | Qdrant |
| Médias | Cloudflare R2 |
| Billing | Stripe |
| CDN/DNS | Cloudflare |
| Déploiement | Coolify (Docker) |

---

## Plans Tarifaires (MAD)

| Plan | Prix/mois | WA Numbers | Conversations/mois |
|------|-----------|-----------|-------------------|
| Trial | Gratuit 14j | 1 | 100 |
| Solo | 690 MAD | 1 | 300 |
| Pro | 1 490 MAD | 3 | 1 000 |
| Agence | 3 490 MAD | 5 | 5 000 |

---

## Routes de l'application

```
/whatsapp/                    ← Redirect → /whatsapp/inbox
/whatsapp/inbox               ← Inbox WhatsApp (page principale)
/whatsapp/inbox/:convId       ← Conversation ouverte
/whatsapp/crm                 ← CRM contacts + Kanban
/whatsapp/crm/:contactId      ← Fiche contact
/whatsapp/campaigns           ← Campagnes broadcast
/whatsapp/flows               ← Flow Builder
/whatsapp/ecommerce/products  ← Produits
/whatsapp/ecommerce/orders    ← Commandes
/whatsapp/ai-agent            ← Config + simulateur agent IA
/whatsapp/ai-agent/logs       ← Logs audio
/whatsapp/analytics           ← Dashboard KPIs
/whatsapp/settings            ← Settings tenant
/whatsapp/settings/billing    ← Billing Stripe
/whatsapp/onboarding          ← Wizard onboarding
```

---

## Dépendances entre projets — CRITIQUE pour la sync

```
packages/shared → utilisé par apps/web ET apps/api
apps/api        → consommé par apps/web (HTTP + WebSocket)
apps/api        → consommé par services/ai (RabbitMQ)
services/ai     → publie vers apps/api (RabbitMQ ai.results)
```

**Règle de sync :** Voir `docs/SYNC-GUIDE.md` — tout changement d'interface doit être documenté là.

---

## Conventions de code

- TypeScript strict sur tous les projets (web + api)
- Python type hints sur services/ai
- Nommage : camelCase variables, PascalCase composants, kebab-case fichiers
- Toute entité définie dans `packages/shared/types/` AVANT implémentation
- Erreurs API : format standard `{ error, message, metric?, limit?, used? }`
- Socket.io events : nommage `resource.action` — définis dans `packages/shared/constants/socketEvents.ts`
- Toute route API préfixée `/api/v1/`
- Sécurité : jamais de token en clair dans les logs, jamais de secret côté client
- Variables VITE_ : côté client uniquement, injectées au BUILD TIME (Astro)

---

## Document de référence complet

Voir `LEADR_SPEC.md` à la racine du repo pretalk-hub pour le plan CTO exhaustif.
Voir `docs/SYNC-GUIDE.md` pour l'état actuel des interfaces entre projets.
