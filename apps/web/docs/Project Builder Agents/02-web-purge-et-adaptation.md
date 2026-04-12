# AGENT 02 — Purge & Adaptation apps/web (Fork pretalk-hub)
> Mission : Nettoyer le codebase pretalk-hub et l'adapter pour pretalkme.
> **Ce travail se fait DANS le dossier `apps/web/` du monorepo.**

---

## Contexte

`apps/web` est une copie de `pretalk-hub`. C'est un projet Astro 5 + React 19 + Supabase.
Il contient de la logique métier propre à pretalk (form builder, lead management, PDF, Express server) qu'on doit supprimer.
On garde : le design system, l'auth Supabase, le routing React SPA, le Docker.

---

## ÉTAPE 1 — Suppression des fichiers pretalk

### Supprimer entièrement ces dossiers/fichiers :

```bash
# Backend Express (remplacé par NestJS dans apps/api)
rm -rf src/server/

# Composants métier pretalk
rm src/components/ReactApp/pages/Forms.tsx
rm src/components/ReactApp/pages/FormBuilder.tsx
rm src/components/ReactApp/components/RealTimeFormPreview.tsx
rm -rf src/components/ReactApp/lib/n8n.ts
rm src/components/ReactApp/lib/phaseConfig.ts
rm src/components/ReactApp/lib/pdf.ts

# Templates et données pretalk
rm -rf src/templates/
rm -rf src/data/
rm -rf scripts/
rm -f config/brevo_templates.json

# Docs pretalk
rm -f BLOG_CMS_PLAN.md DELIVERY_SUMMARY.md FEASIBILITY.md LEADR_FEASIBILITY.md

# Page profil public (n'existe pas dans pretalkme)
rm src/pages/\[username\].astro
```

### Supprimer les dépendances npm inutiles

Dans `package.json`, retirer :
- `express`, `@types/express` (si présent)
- Toute dépendance liée à Gotenberg, n8n, Brevo

### Ajouter les nouvelles dépendances

```bash
npm install socket.io-client
npm install zustand
npm install axios
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install reactflow
npm install wavesurfer.js
npm install react-wavesurfer  # ou implémentation directe
```

---

## ÉTAPE 2 — Adapter le Core

### `src/components/ReactApp/context/AppContext.tsx`

**Remplacer le contexte existant** par un contexte pretalkme. Garder le pattern existant mais changer le contenu :

```typescript
// Retirer : références forms, leads, PDF, n8n, phaseConfig
// Conserver : user, session, plan, signIn/Out methods
// Ajouter :

interface AppContextType {
  // Existant (conserver)
  user: User | null
  session: Session | null
  plan: string
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  // Nouveau pretalkme
  tenantId: string | null
  agentRole: 'owner' | 'admin' | 'agent' | 'viewer' | null
  aiStatus: 'active' | 'paused' | null
}
```

### `src/components/ReactApp/hooks/useApi.ts` (créer)

Hook centralisé pour les appels vers `api.pretalkme.com` :

```typescript
import axios from 'axios'
import { supabase } from '../lib/supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Intercepteur : injecter le JWT Supabase dans chaque requête
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Intercepteur réponse : gestion erreurs standardisée
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Plan limit ou feature non disponible
      const { error: code, message } = error.response.data
      // Dispatch toast ou redirect billing
    }
    return Promise.reject(error)
  }
)

export { api }
```

### `src/components/ReactApp/hooks/useSocket.ts` (créer)

```typescript
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { supabase } from '../lib/supabase'
import { useChatStore } from '../stores/useChatStore'
import { SOCKET_EVENTS } from '@pretalkme/shared/constants/socketEvents'

export function useSocket(tenantId: string | null) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!tenantId) return

    const initSocket = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const socket = io(import.meta.env.VITE_WS_URL, {
        auth: { token: session.access_token },
        transports: ['websocket'],
      })

      socket.on('connect', () => {
        socket.emit(SOCKET_EVENTS.JOIN_INBOX, tenantId)
      })

      socket.on(SOCKET_EVENTS.MESSAGE_NEW, (msg) => {
        useChatStore.getState().addMessage(msg.conversationId, msg)
      })

      socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, (conv) => {
        useChatStore.getState().updateConversation(conv)
      })

      socket.on(SOCKET_EVENTS.AI_THINKING, (data) => {
        useChatStore.getState().setTyping(data.conversationId, true)
      })

      socket.on(SOCKET_EVENTS.HITL_TRIGGERED, (data) => {
        useChatStore.getState().markHITL(data.conversationId, data.reason)
        // Toast notification à l'agent
      })

      socketRef.current = socket
    }

    initSocket()
    return () => { socketRef.current?.disconnect() }
  }, [tenantId])

  return socketRef.current
}
```

### `src/components/ReactApp/stores/useChatStore.ts` (créer)

```typescript
import { create } from 'zustand'
import type { Conversation, Message } from '@pretalkme/shared/types'

interface ChatStore {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  typingConversations: Record<string, boolean>
  hitlConversations: Record<string, string>  // convId → reason

  setConversations: (conversations: Conversation[]) => void
  updateConversation: (conversation: Conversation) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void
  setActiveConversation: (id: string | null) => void
  setTyping: (conversationId: string, typing: boolean) => void
  markHITL: (conversationId: string, reason: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingConversations: {},
  hitlConversations: {},

  setConversations: (conversations) => set({ conversations }),
  updateConversation: (conversation) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.id === conversation.id ? conversation : c
    )
  })),
  setMessages: (conversationId, messages) => set((state) => ({
    messages: { ...state.messages, [conversationId]: messages }
  })),
  addMessage: (conversationId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: [...(state.messages[conversationId] || []), message]
    }
  })),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setTyping: (conversationId, typing) => set((state) => ({
    typingConversations: { ...state.typingConversations, [conversationId]: typing }
  })),
  markHITL: (conversationId, reason) => set((state) => ({
    hitlConversations: { ...state.hitlConversations, [conversationId]: reason }
  })),
}))
```

---

## ÉTAPE 3 — Adapter le Routing React

**IMPORTANT : L'app est montée sur `app.pretalk.me/whatsapp`.**
Le `BrowserRouter` doit avoir `basename="/whatsapp"` et les routes sont définies SANS le préfixe `/whatsapp`.

### Étape 3a — Créer la page Astro catch-all

Créer `src/pages/whatsapp/[...all].astro` (nouveau fichier) :

```astro
---
// src/pages/whatsapp/[...all].astro
// Catch-all Astro qui monte la SPA React WhatsApp IA
---
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>pretalkme — WhatsApp IA</title>
  </head>
  <body>
    <div id="whatsapp-root"></div>
    <!-- Le composant React WhatsApp sera hydraté ici -->
  </body>
</html>
```

### Étape 3b — Configurer le Router React avec basename

Dans le fichier principal de la SPA React (`ReactApp/App.tsx` ou `ReactApp/WhatsappApp.tsx`) :

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Le basename = "/whatsapp" car l'app est montée sur app.pretalk.me/whatsapp
// Les routes sont définies SANS le préfixe /whatsapp
export function WhatsappApp() {
  return (
    <BrowserRouter basename="/whatsapp">
      <Routes>
        <Route path="/" element={<Navigate to="/inbox" replace />} />
        <Route path="/onboarding"            element={<Onboarding />} />
        <Route path="/inbox"                 element={<Inbox />} />
        <Route path="/inbox/:conversationId" element={<Inbox />} />
        <Route path="/crm"                   element={<CRM />} />
        <Route path="/crm/:contactId"        element={<ContactDetail />} />
        <Route path="/campaigns"             element={<Campaigns />} />
        <Route path="/flows"                 element={<FlowBuilder />} />
        <Route path="/ecommerce/products"    element={<Products />} />
        <Route path="/ecommerce/orders"      element={<Orders />} />
        <Route path="/ai-agent"              element={<AIAgent />} />
        <Route path="/ai-agent/logs"         element={<AILogs />} />
        <Route path="/analytics"             element={<Analytics />} />
        <Route path="/settings"              element={<Settings />} />
        <Route path="/settings/billing"      element={<Billing />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### Étape 3c — Créer les pages placeholder

Créer des fichiers placeholder dans `src/components/ReactApp/pages/whatsapp/` :
```typescript
export default function PageName() {
  return <div>PageName — TODO</div>
}
```

---

## ÉTAPE 4 — Adapter la Sidebar

Dans `src/components/ReactApp/components/layout/Sidebar.tsx`, remplacer les items de navigation :

```typescript
import { MessageSquare, Users, Megaphone, GitBranch, ShoppingBag, Bot, BarChart2, Settings } from 'lucide-react'

// Les paths sont relatifs au basename /whatsapp — pas besoin du préfixe
const navItems = [
  { label: 'Inbox',       icon: MessageSquare, path: '/inbox',              badge: 'unread' },
  { label: 'CRM',         icon: Users,         path: '/crm' },
  { label: 'Campagnes',   icon: Megaphone,     path: '/campaigns' },
  { label: 'Flows',       icon: GitBranch,     path: '/flows' },
  { label: 'E-Commerce',  icon: ShoppingBag,   path: '/ecommerce/products' },
  { label: 'Agent IA',    icon: Bot,           path: '/ai-agent' },
  { label: 'Analytics',   icon: BarChart2,     path: '/analytics' },
  { label: 'Paramètres',  icon: Settings,      path: '/settings' },
]
```

---

## ÉTAPE 5 — Variables d'Environnement

Créer `.env.local` dans `apps/web/` :

```env
# Supabase (récupérer depuis le projet Supabase pretalkme)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# API Backend (dev local)
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000

# En production ces valeurs seront :
# VITE_API_URL=https://api.pretalk.me
# VITE_WS_URL=wss://api.pretalk.me

# Sentry (optionnel dev)
# SENTRY_AUTH_TOKEN=...
```

---

## ÉTAPE 6 — Adapter le Dockerfile

Modifier `apps/web/Dockerfile` pour retirer toute référence à Express :

```dockerfile
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
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

## Résultat attendu

- `apps/web` compile sans erreur (`npm run build` passe)
- Plus aucune référence à `express`, `n8n`, `brevo`, `gotenberg`, `form builder`
- Routing React contient toutes les routes pretalkme (pages placeholder)
- Sidebar affiche la navigation pretalkme
- `useSocket` et `useChatStore` créés et importables
- `useApi` (axios) prêt avec intercepteur JWT

## Vérification

```bash
cd apps/web
npm run dev
# → Astro démarre sur port 3000
# → http://localhost:3000/whatsapp/inbox affiche "Inbox — TODO"
# → Aucune erreur TypeScript dans la console
```

---

## ⚠️ Actions à faire par le propriétaire du projet (toi)

Une fois cette étape terminée par l'agent, tu dois faire les choses suivantes de ton côté :

```
□ Supabase — Créer un nouveau projet sur cloud.supabase.com
  → Récupérer : Project URL, anon key, service_role key
  → Les renseigner dans apps/web/.env.local

□ Cloudflare — Vérifier que app.pretalk.me pointe vers ton serveur
  → Type A : app → IP du VPS Coolify (Proxied ✅)

□ Documenter dans docs/SYNC-GUIDE.md :
  → URL de l'app : https://app.pretalk.me/whatsapp
  → URL API (dev) : http://localhost:4000
  → URL API (prod) : https://api.pretalk.me
```
