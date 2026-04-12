# AGENT 11 — Système de Notifications (In-App + Push)
> Mission : Implémenter le système de notifications complet de pretalkme.
> **Travail dans `apps/api/src/modules/notifications/` et `apps/web/src/components/ReactApp/components/notifications/`**

---

## Contexte

Les agents de l'équipe doivent être notifiés en temps réel de plusieurs événements :
- Nouvelle conversation entrante (message WhatsApp reçu)
- Transfert HITL (l'IA demande une intervention humaine)
- Message non lu depuis X minutes
- Quota plan à 80%

Les notifications existent en **2 canaux** :
1. **In-app** : Cloche + badge dans le dashboard (via Socket.io — déjà partiellement implémenté)
2. **Email** : Si l'agent n'est pas connecté (via Agent 10 — EmailService)

---

## Partie 1 — Backend (apps/api)

### `src/modules/notifications/notifications.service.ts`

```typescript
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { supabase } from '../../infrastructure/supabase/supabase.client'
import { ConversationsGateway } from '../conversations/conversations.gateway'
import { EmailService } from '../email/email.service'
import { RedisService } from '../../infrastructure/redis/redis.service'

export type NotificationType =
  | 'new_message'
  | 'hitl_triggered'
  | 'conversation_assigned'
  | 'quota_warning'
  | 'message_unread'

export interface Notification {
  id: string
  tenantId: string
  userId: string
  type: NotificationType
  title: string
  body: string
  metadata: Record<string, any>
  read: boolean
  createdAt: string
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly gateway: ConversationsGateway,
    private readonly emailService: EmailService,
    private readonly redis: RedisService,
  ) {}

  // ─── Notifier un événement ─────────────────────────────────

  async notify(params: {
    tenantId: string
    userId: string
    type: NotificationType
    title: string
    body: string
    metadata?: Record<string, any>
    conversationUrl?: string
  }) {
    // 1. Sauvegarder la notification en DB (table notifications)
    const { data: notif } = await supabase.from('notifications').insert({
      tenant_id: params.tenantId,
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      metadata: params.metadata || {},
      read: false,
    }).select().single()

    // 2. Émettre via Socket.io (in-app temps réel)
    this.gateway.emitNotification(params.tenantId, {
      id: notif.id,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      metadata: params.metadata || {},
      createdAt: notif.created_at,
    })

    // 3. Si l'agent n'est pas connecté → email
    const isOnline = await this.isUserOnline(params.userId)
    if (!isOnline && params.conversationUrl) {
      await this.sendEmailFallback(params, notif)
    }

    return notif
  }

  // ─── Helpers ───────────────────────────────────────────────

  private async isUserOnline(userId: string): Promise<boolean> {
    // Redis : clé `online:{userId}` mise à jour par le Gateway Socket.io
    const online = await this.redis.get(`online:${userId}`)
    return !!online
  }

  private async sendEmailFallback(params: any, notif: any) {
    const { data: user } = await supabase.from('users').select('email, name').eq('id', params.userId).single()
    if (!user?.email) return

    if (params.type === 'hitl_triggered') {
      const { contactName, contactPhone, reason } = params.metadata || {}
      const { data: tenant } = await supabase.from('tenants').select('name').eq('id', params.tenantId).single()
      await this.emailService.sendHITLAlert({
        agentEmail: user.email,
        agentName: user.name,
        contactName: contactName || 'Client',
        contactPhone: contactPhone || '',
        reason: reason || 'Transfert IA',
        conversationUrl: params.conversationUrl,
        tenantName: tenant?.name || 'pretalkme',
      })
    }
    // Autres types d'email à ajouter ici si besoin
  }

  // ─── HITL (méthode rapide appelée depuis conversations.service) ──

  async notifyHITL(params: {
    tenantId: string
    assignedAgentId: string | null
    conversationId: string
    contactName: string
    contactPhone: string
    reason: string
  }) {
    // Si un agent est assigné, le notifier
    // Sinon, notifier tous les admins du tenant

    let userIds: string[] = []
    if (params.assignedAgentId) {
      userIds = [params.assignedAgentId]
    } else {
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('tenant_id', params.tenantId)
        .in('role', ['owner', 'admin'])
      userIds = admins?.map(a => a.id) || []
    }

    const convUrl = `https://app.pretalk.me/whatsapp/inbox/${params.conversationId}`

    for (const userId of userIds) {
      await this.notify({
        tenantId: params.tenantId,
        userId,
        type: 'hitl_triggered',
        title: '⚠️ Intervention requise',
        body: `${params.contactName} : ${params.reason}`,
        metadata: {
          conversationId: params.conversationId,
          contactName: params.contactName,
          contactPhone: params.contactPhone,
          reason: params.reason,
        },
        conversationUrl: convUrl,
      })
    }
  }

  // ─── Nouvelles conversations ──────────────────────────────

  async notifyNewMessage(params: {
    tenantId: string
    conversationId: string
    contactName: string
    messagePreview: string
  }) {
    // Notifier tous les agents connectés du tenant via Socket.io
    // (pas d'email pour chaque message — trop de volume)
    this.gateway.emitNotification(params.tenantId, {
      type: 'new_message',
      title: `💬 ${params.contactName}`,
      body: params.messagePreview.substring(0, 80),
      metadata: { conversationId: params.conversationId },
    })
  }

  // ─── API : marquer comme lu ─────────────────────────────────

  async markAsRead(tenantId: string, userId: string, notificationId: string) {
    await supabase.from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
  }

  async markAllAsRead(tenantId: string, userId: string) {
    await supabase.from('notifications')
      .update({ read: true })
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('read', false)
  }

  async getNotifications(tenantId: string, userId: string, limit = 20) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  }

  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('read', false)
    return count || 0
  }
}
```

### `src/modules/notifications/notifications.controller.ts`

```typescript
@Controller('api/v1/notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  @Get()
  getAll(@Req() req) {
    return this.notificationsService.getNotifications(req.tenantId, req.userId)
  }

  @Get('unread-count')
  getUnreadCount(@Req() req) {
    return this.notificationsService.getUnreadCount(req.tenantId, req.userId)
  }

  @Patch(':id/read')
  markRead(@Req() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.tenantId, req.userId, id)
  }

  @Patch('read-all')
  markAllRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.tenantId, req.userId)
  }
}
```

### Mise à jour du `ConversationsGateway` — tracker les utilisateurs en ligne

```typescript
// Dans conversations.gateway.ts, ajouter :

handleConnection(client: Socket) {
  const userId = client.data.userId  // extrait par WsAuthGuard
  const tenantId = client.data.tenantId
  client.join(`tenant:${tenantId}`)
  client.join(`user:${userId}`)

  // Marquer l'utilisateur comme en ligne dans Redis (TTL 60s)
  this.redis.set(`online:${userId}`, '1', 'EX', 60)
}

handleDisconnect(client: Socket) {
  const userId = client.data.userId
  this.redis.del(`online:${userId}`)
}

// Heartbeat : le client envoie un ping toutes les 30s pour rester "online"
@SubscribeMessage('heartbeat')
handleHeartbeat(client: Socket) {
  const userId = client.data.userId
  this.redis.set(`online:${userId}`, '1', 'EX', 60)
}
```

### Table Supabase à ajouter (Script SQL)

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  metadata    JSONB DEFAULT '{}',
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(tenant_id, user_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications isolation" ON notifications
  FOR ALL USING (tenant_id = get_my_tenant_id());

-- Nettoyage automatique : supprimer les notifications > 30 jours
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications WHERE created_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

---

## Partie 2 — Frontend (apps/web)

### `NotificationBell.tsx` — Composant cloche dans la Sidebar

```typescript
// src/components/ReactApp/components/notifications/NotificationBell.tsx

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApi } from '../../hooks/useApi'
import { useChatStore } from '../../stores/useChatStore'
import type { Notification } from '@pretalkme/shared/types'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const { api } = useApi()

  // Charger les notifications au montage
  useEffect(() => {
    api.get('/api/v1/notifications').then(r => setNotifications(r.data))
    api.get('/api/v1/notifications/unread-count').then(r => setUnreadCount(r.data.count))
  }, [])

  // Socket.io : écouter les nouvelles notifications (depuis useSocket dans AppContext)
  useEffect(() => {
    const socket = useChatStore.getState().socket  // ou depuis un contexte dédié
    if (!socket) return
    socket.on('notification', (notif: Notification) => {
      setNotifications(prev => [notif, ...prev])
      setUnreadCount(prev => prev + 1)
      // Toast visuel
      showToast(notif)
    })
    return () => socket.off('notification')
  }, [])

  const markAllRead = async () => {
    await api.patch('/api/v1/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && unreadCount > 0) markAllRead()
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {notifications.some(n => !n.read) && (
            <button onClick={markAllRead} className="text-xs text-green-600 hover:underline">
              Tout marquer lu
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              Aucune notification
            </div>
          ) : (
            notifications.map(notif => (
              <NotificationItem key={notif.id} notification={notif} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationItem({ notification: n }: { notification: Notification }) {
  const icons = {
    hitl_triggered:        '⚠️',
    new_message:           '💬',
    conversation_assigned: '👤',
    quota_warning:         '📊',
    message_unread:        '🔔',
  }

  return (
    <div className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-green-50' : ''}`}>
      <div className="flex gap-3">
        <span className="text-lg">{icons[n.type] || '🔔'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900">{n.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
          <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
        </div>
        {!n.read && <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />}
      </div>
    </div>
  )
}
```

### Toast pour notifications temps réel

```typescript
// src/components/ReactApp/components/notifications/useNotificationToast.ts

import toast from 'react-hot-toast'  // déjà dans pretalk-hub

export function showToast(notif: { type: string; title: string; body: string; metadata?: any }) {
  if (notif.type === 'hitl_triggered') {
    toast.custom((t) => (
      <div className={`bg-orange-50 border border-orange-200 rounded-xl shadow-lg px-4 py-3 flex gap-3 max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-semibold text-orange-900 text-sm">{notif.title}</p>
          <p className="text-orange-700 text-xs mt-0.5">{notif.body}</p>
        </div>
      </div>
    ), { duration: 8000, position: 'top-right' })
  } else {
    toast(notif.title, {
      icon: notif.type === 'new_message' ? '💬' : '🔔',
      duration: 4000,
      position: 'top-right',
    })
  }
}
```

### Intégration dans la Sidebar

```typescript
// Dans Sidebar.tsx, ajouter la cloche de notification :
import { NotificationBell } from '../notifications/NotificationBell'

// Dans le JSX de la sidebar (en bas ou en haut) :
<div className="flex items-center gap-2 px-4 py-3 border-t">
  <NotificationBell />
  <span className="text-sm text-gray-600">{user?.name}</span>
</div>
```

---

## Heartbeat Socket.io (côté frontend)

```typescript
// Dans useSocket.ts, ajouter le heartbeat :

// Envoyer un ping toutes les 30s pour rester "online"
const heartbeatInterval = setInterval(() => {
  socket.emit('heartbeat')
}, 30000)

return () => {
  clearInterval(heartbeatInterval)
  socket.disconnect()
}
```

---

## Vérification

```
Backend :
□ POST /api/v1/conversations/:id/takeover → génère une notification HITL
□ GET /api/v1/notifications → retourne la liste
□ GET /api/v1/notifications/unread-count → retourne { count: N }
□ PATCH /api/v1/notifications/read-all → marque tout comme lu

Frontend :
□ La cloche affiche le badge rouge avec le nombre de non-lus
□ Ouvrir le popover → liste des notifications
□ Réception d'un HITL via Socket.io → toast orange s'affiche
□ Badge se remet à 0 après ouverture du popover

Emails :
□ Déclencher un HITL avec l'agent déconnecté → email reçu (voir Agent 10)
```

---

## ⚠️ Actions à faire par le propriétaire du projet (toi)

```
□ Aucune configuration externe requise pour ce module.
   Tout dépend de Socket.io (déjà configuré Agent 06)
   et Resend (configuré Agent 10).

□ Vérifier dans Supabase que la table notifications a bien été créée
   (script SQL dans ce prompt, section "Table Supabase à ajouter").

□ Documenter dans docs/SYNC-GUIDE.md :
   - Événement Socket.io : 'notification' — format { id, type, title, body, metadata }
   - Heartbeat : client émet 'heartbeat' toutes les 30s
   - Redis key : online:{userId} — TTL 60s
```
