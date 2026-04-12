# AGENT 03 — UI/UX Inbox WhatsApp (Page Principale)
> Mission : Construire la page Inbox complète — la page la plus importante du produit.
> **Travail dans `apps/web/src/components/ReactApp/pages/Inbox.tsx` et ses sous-composants.**

---

## Contexte

L'inbox est le cœur de pretalkme. C'est là que les agents voient les conversations WhatsApp en temps réel, lisent les voice notes, et interagissent avec l'IA ou prennent la main manuellement.

L'inbox utilise :
- `useChatStore` (Zustand) — déjà créé par Agent 02
- `useSocket` (Socket.io) — déjà créé par Agent 02
- `useApi` (Axios) — déjà créé par Agent 02
- Design system existant : Tailwind CSS + ShadCN/ui

---

## Layout Général (Desktop)

```
┌─────────────┬──────────────────────┬───────────────────────────────┐
│   Sidebar   │  Liste Conversations  │   Zone Chat + Panneau CRM     │
│  (existant) │      (colonne 2)      │        (colonne 3)            │
│             │                       │ ┌─────────────────────────┐   │
│             │  [Filtre rapide]       │ │     Chat (haut 60%)     │   │
│             │  [Recherche]           │ ├─────────────────────────┤   │
│             │                       │ │   Panneau CRM (bas 40%) │   │
│             │  [Conv 1]             │ └─────────────────────────┘   │
│             │  [Conv 2]             │                               │
│             │  ...                  │                               │
└─────────────┴──────────────────────┴───────────────────────────────┘
```

Sur mobile : une seule colonne, navigation par swipe/back button.

---

## Composants à créer

### 1. `Inbox.tsx` (page principale)

```typescript
// src/components/ReactApp/pages/Inbox.tsx
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ConversationList } from '../components/inbox/ConversationList'
import { ChatPanel } from '../components/inbox/ChatPanel'
import { ContactPanel } from '../components/inbox/ContactPanel'
import { useSocket } from '../hooks/useSocket'
import { useChatStore } from '../stores/useChatStore'
import { useApi } from '../hooks/useApi'
import { useAppContext } from '../context/AppContext'

export default function Inbox() {
  const { conversationId } = useParams()
  const { tenantId } = useAppContext()
  const { setConversations, setActiveConversation } = useChatStore()
  const { api } = useApi()
  useSocket(tenantId)  // initialise Socket.io

  useEffect(() => {
    api.get('/api/v1/conversations').then(res => setConversations(res.data))
  }, [])

  useEffect(() => {
    if (conversationId) setActiveConversation(conversationId)
  }, [conversationId])

  return (
    <div className="flex h-screen overflow-hidden">
      <ConversationList />
      {conversationId ? (
        <>
          <ChatPanel conversationId={conversationId} />
          <ContactPanel conversationId={conversationId} />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
```

---

### 2. `ConversationList.tsx`

**Fonctionnalités :**
- Liste des conversations depuis `useChatStore`
- Filtres rapides (tabs) : `Tous` | `IA Active` | `En attente` | `Humain` | `Résolu`
- Recherche full-text (nom, numéro, dernier message)
- Chaque item affiche :
  - Avatar (initiales colorées si pas de photo)
  - Nom contact + numéro WA
  - Dernier message (tronqué 60 chars)
  - Timestamp relatif (il y a 5 min, hier...)
  - Badge statut : `🤖` (IA active) ou `👤` (humain) ou `⏳` (en attente)
  - Point rouge si messages non lus

```typescript
// Exemple structure item conversation
interface ConversationItemProps {
  id: string
  contactName: string
  contactPhone: string
  lastMessage: string
  lastMessageAt: string
  status: 'open' | 'pending_human' | 'resolved'
  aiActive: boolean
  unreadCount: number
  assignedAgent?: { name: string; avatarUrl?: string }
}
```

**Filtres (tabs ShadCN) :**
```typescript
const filters = [
  { key: 'all',          label: 'Tous' },
  { key: 'ai_active',   label: '🤖 IA Active' },
  { key: 'pending',     label: '⏳ En attente' },
  { key: 'human',       label: '👤 Humain' },
  { key: 'resolved',    label: '✅ Résolu' },
]
```

---

### 3. `ChatPanel.tsx`

**Zone de bulles :**

```typescript
// Bonne référence visuelle : WhatsApp Web
// Messages de droite (outbound) couleur verte/bleue
// Messages de gauche (inbound) couleur grise
// Badge IA sur les messages générés automatiquement

interface MessageBubbleProps {
  message: Message
  isLast: boolean
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound'
  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
        isOutbound ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        {/* Badge IA */}
        {message.isAiGenerated && (
          <span className="text-xs opacity-70 flex items-center gap-1 mb-1">
            🤖 Message IA
          </span>
        )}
        {/* Contenu selon type */}
        {message.type === 'text' && <p>{message.content}</p>}
        {message.type === 'audio' && <AudioPlayer url={message.mediaUrl} />}
        {message.type === 'image' && <img src={message.mediaUrl} className="rounded-lg max-w-full" />}
        {/* Timestamp + statut */}
        <div className="text-xs opacity-60 text-right mt-1">
          {formatTime(message.createdAt)}
          {isOutbound && <StatusTick status={message.status} />}
        </div>
      </div>
    </div>
  )
}
```

**Player Audio (voice notes) :**

```typescript
// Utiliser wavesurfer.js pour afficher la forme d'onde
import WaveSurfer from 'wavesurfer.js'

function AudioPlayer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const wsRef = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    wsRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4ade80',
      progressColor: '#16a34a',
      height: 32,
      barWidth: 2,
      barGap: 1,
      url,
    })
    wsRef.current.on('ready', () => setDuration(wsRef.current!.getDuration()))
    return () => wsRef.current?.destroy()
  }, [url])

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <button onClick={() => { wsRef.current?.playPause(); setIsPlaying(p => !p) }}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div ref={containerRef} className="flex-1" />
      <span className="text-xs">{formatDuration(duration)}</span>
    </div>
  )
}
```

**Indicateur "IA réfléchit..." :**

```typescript
// Afficher pendant que l'IA traite (event ai.thinking reçu via Socket.io)
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm px-4 py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>pretalkme IA réfléchit...</span>
    </div>
  )
}
```

**Zone de saisie :**

```typescript
function MessageInput({ conversationId }: { conversationId: string }) {
  const [text, setText] = useState('')
  const [isNote, setIsNote] = useState(false)
  const { api } = useApi()

  const sendMessage = async () => {
    if (!text.trim()) return
    if (isNote) {
      await api.post(`/api/v1/conversations/${conversationId}/notes`, { content: text })
    } else {
      await api.post(`/api/v1/conversations/${conversationId}/messages`, {
        type: 'text', content: text
      })
    }
    setText('')
  }

  return (
    <div className={`border-t p-4 ${isNote ? 'bg-yellow-50' : 'bg-white'}`}>
      {isNote && (
        <div className="text-xs text-yellow-600 mb-2">📝 Note interne (visible agents seulement)</div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder={isNote ? "Ajouter une note interne..." : "Tapez un message..."}
          className="flex-1 resize-none rounded-xl border px-4 py-2 max-h-32"
          rows={1}
        />
        <button onClick={() => setIsNote(n => !n)} title="Note interne">
          {isNote ? <MessageSquare /> : <StickyNote />}
        </button>
        <button onClick={sendMessage} className="bg-green-600 text-white rounded-xl px-4 py-2">
          Envoyer
        </button>
      </div>
    </div>
  )
}
```

**Boutons HITL :**

```typescript
function HITLControls({ conversation }: { conversation: Conversation }) {
  const { api } = useApi()

  const takeOver = async () => {
    await api.post(`/api/v1/conversations/${conversation.id}/takeover`)
    // Socket.io va updater conversation.aiActive → false
  }

  const releaseToAI = async () => {
    await api.post(`/api/v1/conversations/${conversation.id}/release-ai`)
  }

  return (
    <div className="flex gap-2 px-4 py-2 border-b bg-gray-50">
      {conversation.aiActive ? (
        <button
          onClick={takeOver}
          className="flex items-center gap-2 text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full"
        >
          👤 Prendre la main
        </button>
      ) : (
        <button
          onClick={releaseToAI}
          className="flex items-center gap-2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full"
        >
          🤖 Repasser à l'IA
        </button>
      )}
      {conversation.status === 'pending_human' && (
        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
          ⚠️ Transfert IA — Agent requis
        </span>
      )}
    </div>
  )
}
```

---

### 4. `ContactPanel.tsx`

Panneau latéral droit bas affichant le CRM du contact.

```typescript
// Sections :
// 1. Infos contact (nom, téléphone, source, date premier contact)
// 2. Tags (chips éditables avec input + delete)
// 3. Pipeline stage (Select ShadCN avec les stages)
// 4. Commandes récentes (liste cliquable)
// 5. Notes internes (liste + formulaire ajout)
// 6. Timeline HITL (events IA → humain avec dates et raisons)

const PIPELINE_STAGES = [
  { value: 'new',          label: '🆕 Nouveau' },
  { value: 'qualified',    label: '✅ Qualifié' },
  { value: 'proposed',     label: '📋 Proposé' },
  { value: 'negotiating',  label: '🤝 Négociation' },
  { value: 'won',          label: '🏆 Gagné' },
  { value: 'lost',         label: '❌ Perdu' },
]
```

---

## Résultat attendu

- Page `/app/inbox` affiche la liste des conversations depuis l'API
- Clic sur une conversation → affiche le chat avec les messages
- Voice notes : player avec forme d'onde fonctionnel
- Badge IA / Humain visible sur chaque conversation et message
- Boutons "Prendre la main" / "Repasser à l'IA" fonctionnels
- Notes internes différenciées visuellement des messages
- Panneau CRM contact avec tags et pipeline stage
- Temps réel : nouveaux messages apparaissent sans refresh
- Responsive : fonctionne sur mobile (colonnes collapsées)

## Vérification

```bash
# En local avec apps/api qui tourne en mock mode
cd apps/web && npm run dev
# → Ouvrir http://localhost:3000/app/inbox
# → La liste des conversations s'affiche
# → Cliquer une conversation → chat visible
# → Envoyer un message → il apparaît dans les bulles
# → Player audio fonctionne sur une voice note
```
