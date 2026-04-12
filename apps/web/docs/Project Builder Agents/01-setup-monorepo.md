# AGENT 01 — Setup Monorepo Turborepo
> Mission : Créer la structure racine du monorepo pretalkme et initialiser Turborepo.

---

## Contexte

Tu travailles sur le projet **pretalkme**. Tu dois créer le monorepo Turborepo qui va accueillir :
- `apps/web` : le fork de pretalk-hub (Astro + React)
- `apps/api` : le backend NestJS (nouveau projet)
- `services/ai` : le service FastAPI Python
- `packages/shared` : les types TypeScript et constantes partagées

Le repo `pretalk-hub` existant deviendra `apps/web` (copié, pas déplacé — on garde l'original intact).

---

## Ce que tu dois faire

### 1. Initialiser la racine du monorepo

Crée un nouveau dossier `pretalkme/` avec la structure suivante :

```
pretalkme/
├── apps/
│   ├── web/             ← Copie de pretalk-hub (SANS .git)
│   └── api/             ← Scaffold NestJS (voir étape 3)
├── services/
│   └── ai/              ← Dossier vide avec Dockerfile placeholder
├── packages/
│   └── shared/          ← Types partagés (voir étape 4)
├── turbo.json
├── package.json         ← Root package.json (workspaces)
├── .gitignore
└── docker-compose.yml   ← Dev local (voir contenu ci-dessous)
```

### 2. Fichiers racine à créer

**`package.json` racine :**
```json
{
  "name": "pretalkme",
  "private": true,
  "workspaces": ["apps/*", "packages/*", "services/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.9.3"
  }
}
```

**`turbo.json` :**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

**`.gitignore` :**
```
node_modules/
dist/
.env
.env.local
*.ogg
*.mp3
__pycache__/
.turbo/
```

### 3. Scaffold apps/api (NestJS)

Dans `apps/api/`, exécute :
```bash
npx @nestjs/cli new api --skip-git --package-manager npm
```

Puis installe les dépendances pretalkme :
```bash
cd apps/api
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/microservices amqplib amqp-connection-manager
npm install @supabase/supabase-js
npm install ioredis
npm install @nestjs/throttler
npm install @nestjs/config
npm install axios
npm install --save-dev @types/amqplib
```

Crée la structure des modules (dossiers vides avec `index.ts` placeholder) :
```
apps/api/src/modules/
├── auth/
├── tenants/
├── whatsapp/
├── conversations/
├── contacts/
├── ai/
├── campaigns/
├── flows/
├── ecommerce/
├── billing/
└── notifications/
apps/api/src/infrastructure/
├── supabase/
├── redis/
├── rabbitmq/
└── r2/
apps/api/src/common/
├── guards/
├── decorators/
├── filters/
└── interceptors/
```

### 4. Scaffold packages/shared

```
packages/shared/
├── package.json
├── tsconfig.json
├── types/
│   ├── index.ts
│   ├── tenant.ts
│   ├── conversation.ts
│   ├── message.ts
│   ├── contact.ts
│   ├── order.ts
│   ├── product.ts
│   ├── ai-run.ts
│   └── plan.ts
└── constants/
    ├── planLimits.ts
    ├── socketEvents.ts
    └── hitlTriggers.ts
```

**`packages/shared/constants/socketEvents.ts` :**
```typescript
export const SOCKET_EVENTS = {
  MESSAGE_NEW: 'message.new',
  CONVERSATION_UPDATED: 'conversation.updated',
  AI_THINKING: 'ai.thinking',
  HITL_TRIGGERED: 'hitl.triggered',
  NOTIFICATION: 'notification',
  JOIN_INBOX: 'join_inbox',
} as const
```

**`packages/shared/types/message.ts` :**
```typescript
export type MessageDirection = 'inbound' | 'outbound'
export type MessageType = 'text' | 'audio' | 'image' | 'video' | 'document' | 'template'
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  tenantId: string
  conversationId: string
  direction: MessageDirection
  type: MessageType
  content?: string
  mediaUrl?: string
  isAiGenerated: boolean
  aiConfidence?: number
  wamid?: string
  status: MessageStatus
  createdAt: string
}
```

**`packages/shared/constants/planLimits.ts` :**
Copie le contenu exact de la Section 6 de `LEADR_SPEC.md`.

### 5. docker-compose.yml (Dev Local)

```yaml
version: '3.9'
services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    env_file: ./apps/web/.env.local
    depends_on:
      - api

  api:
    build: ./apps/api
    ports:
      - "4000:4000"
    env_file: ./apps/api/.env
    depends_on:
      - redis
      - rabbitmq

  ai:
    build: ./services/ai
    ports:
      - "8000:8000"
    env_file: ./services/ai/.env
    depends_on:
      - rabbitmq
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: pretalkme
      RABBITMQ_DEFAULT_PASS: secret_local

  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  qdrant_data:
```

---

## Résultat attendu

- Monorepo Turborepo opérationnel avec `npm run dev` à la racine
- `apps/web` est une copie de pretalk-hub (prête pour la purge — Agent 02)
- `apps/api` a le scaffold NestJS avec tous les modules créés en dossiers
- `packages/shared` contient tous les types et constantes
- `docker-compose.yml` permet de lancer tous les services en local

## Vérification

```bash
# À la racine
npm install
turbo run build  # doit passer (les apps sont vides mais compilables)
docker-compose up redis rabbitmq  # Redis + RabbitMQ doivent démarrer
```
