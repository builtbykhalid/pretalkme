# AGENT 06 — Backend NestJS (apps/api) — Core Complet
> Mission : Implémenter le backend NestJS entier de pretalkme.
> **Travail dans `apps/api/src/`**

---

## Contexte

`apps/api` est un projet NestJS scaffoldé (Agent 01). Il doit implémenter :
- Auth Guard (validation JWT Supabase)
- Webhook Meta WhatsApp (réception + vérification HMAC)
- Gestion conversations / messages / contacts
- WebSocket Gateway (Socket.io temps réel)
- Publisher RabbitMQ vers le service IA
- Intégrations e-commerce (YouCan, Shopify, WooCommerce)
- Campagnes broadcast
- Flows execution engine
- Billing Stripe
- Plan Guards

**Base de données** : Supabase PostgreSQL (schéma déjà créé par Agent 09).
Le backend utilise le **service role key** Supabase pour bypasser le RLS.
Le RLS est la sécurité côté DB — le backend n'en a pas besoin, il l'impose lui-même via `tenantId`.

---

## MODULE 1 — Auth & Tenant

### `src/infrastructure/supabase/supabase.client.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
```

### `src/common/guards/auth.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { supabase } from '../../infrastructure/supabase/supabase.client'

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) throw new UnauthorizedException('Token manquant')

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) throw new UnauthorizedException('Token invalide')

    // Récupérer le tenant_id depuis la table users
    const { data: userRecord } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!userRecord) throw new UnauthorizedException('Utilisateur non trouvé')

    request.userId = user.id
    request.tenantId = userRecord.tenant_id
    request.userRole = userRecord.role
    return true
  }
}
```

### `src/common/guards/plan.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { supabase } from '../../infrastructure/supabase/supabase.client'

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metric = this.reflector.get<string>('plan_metric', context.getHandler())
    if (!metric) return true

    const request = context.switchToHttp().getRequest()
    const { tenantId } = request

    const { data } = await supabase.rpc('check_plan_limit', {
      p_tenant_id: tenantId,
      p_metric: metric
    })

    if (!data?.allowed) {
      throw new ForbiddenException({
        error: 'PLAN_LIMIT_EXCEEDED',
        message: `Vous avez atteint votre limite de ${data?.limit} ${metric} ce mois-ci.`,
        metric,
        limit: data?.limit,
        used: data?.used,
      })
    }
    return true
  }
}

// Décorateur pour l'utiliser sur les routes
export const PlanMetric = (metric: string) => SetMetadata('plan_metric', metric)
```

---

## MODULE 2 — WhatsApp (Webhook + Envoi)

### `src/modules/whatsapp/whatsapp.controller.ts`

```typescript
@Controller('webhook')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  // Vérification webhook Meta (GET)
  @Get('meta')
  verifyWebhook(@Query() query: any, @Res() res: Response) {
    const mode = query['hub.mode']
    const token = query['hub.verify_token']
    const challenge = query['hub.challenge']

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      return res.status(200).send(challenge)
    }
    return res.status(403).send('Forbidden')
  }

  // Réception messages Meta (POST)
  @Post('meta')
  @HttpCode(200)
  async receiveWebhook(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature: string,
    @Res() res: Response
  ) {
    // 1. Vérifier signature HMAC
    const isValid = this.whatsappService.verifySignature(
      JSON.stringify(body),
      signature,
      process.env.META_APP_SECRET!
    )
    if (!isValid) return res.status(403).send('Invalid signature')

    // 2. Traiter de manière asynchrone (ne pas bloquer Meta)
    this.whatsappService.processWebhookAsync(body)

    // 3. Répondre immédiatement 200 à Meta
    return res.status(200).send('OK')
  }
}
```

### `src/modules/whatsapp/whatsapp.service.ts`

```typescript
@Injectable()
export class WhatsappService {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly conversationsService: ConversationsService,
  ) {}

  verifySignature(body: string, signature: string, secret: string): boolean {
    const expected = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex')
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  }

  async processWebhookAsync(body: any) {
    // Parser le format Meta webhook
    const entries = body.entry || []
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue
        const messages = change.value?.messages || []
        for (const msg of messages) {
          await this.handleInboundMessage(change.value, msg)
        }
      }
    }
  }

  async handleInboundMessage(value: any, metaMsg: any) {
    const phoneNumberId = value.metadata.phone_number_id

    // 1. Trouver le tenant via phone_number_id
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, ai_enabled')
      .eq('wa_phone_id', phoneNumberId)
      .single()

    if (!tenant) return

    // 2. Upsert contact
    const contact = await this.upsertContact(tenant.id, metaMsg)

    // 3. Upsert conversation
    const conversation = await this.upsertConversation(tenant.id, contact.id)

    // 4. Sauvegarder le message
    const message = await this.saveMessage(tenant.id, conversation.id, metaMsg)

    // 5. Si audio : télécharger depuis Meta CDN → upload R2
    let audioUrl: string | null = null
    if (metaMsg.type === 'audio') {
      audioUrl = await this.downloadAndUploadAudio(tenant.id, metaMsg.audio.id)
    }

    // 6. Publier sur RabbitMQ si IA active
    if (tenant.ai_enabled && conversation.ai_active) {
      await this.rabbitmqService.publish('ai.tasks', {
        tenantId: tenant.id,
        conversationId: conversation.id,
        messageId: message.id,
        textMessage: metaMsg.text?.body || null,
        audioUrl,
      })
    }

    // 7. Notifier le frontend via Socket.io
    this.conversationsGateway.emitNewMessage(tenant.id, message)
  }

  // Envoyer un message texte via Meta Graph API
  async sendTextMessage(tenantPhoneId: string, metaToken: string, toPhone: string, text: string) {
    await axios.post(
      `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION}/${tenantPhoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'text',
        text: { body: text }
      },
      { headers: { Authorization: `Bearer ${metaToken}` } }
    )
  }

  // Envoyer une voice note (.ogg) via Meta Graph API
  async sendAudioMessage(tenantPhoneId: string, metaToken: string, toPhone: string, audioUrl: string) {
    await axios.post(
      `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION}/${tenantPhoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'audio',
        audio: { link: audioUrl }  // URL publique R2 signée
      },
      { headers: { Authorization: `Bearer ${metaToken}` } }
    )
  }
}
```

---

## MODULE 3 — Conversations & WebSocket Gateway

### `src/modules/conversations/conversations.gateway.ts`

```typescript
@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN, credentials: true },
  namespace: '/',
})
@UseGuards(WsAuthGuard)  // Valider JWT au handshake
export class ConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    const tenantId = client.data.tenantId  // injecté par WsAuthGuard
    client.join(`tenant:${tenantId}`)
  }

  handleDisconnect(client: Socket) {}

  // Émetteurs appelés depuis les services
  emitNewMessage(tenantId: string, message: any) {
    this.server.to(`tenant:${tenantId}`).emit('message.new', message)
  }

  emitConversationUpdated(tenantId: string, conversation: any) {
    this.server.to(`tenant:${tenantId}`).emit('conversation.updated', conversation)
  }

  emitAIThinking(tenantId: string, conversationId: string) {
    this.server.to(`tenant:${tenantId}`).emit('ai.thinking', { conversationId })
  }

  emitHITLTriggered(tenantId: string, data: { conversationId: string; reason: string }) {
    this.server.to(`tenant:${tenantId}`).emit('hitl.triggered', data)
  }
}
```

### `src/modules/conversations/conversations.controller.ts`

```typescript
@Controller('api/v1/conversations')
@UseGuards(AuthGuard)
export class ConversationsController {
  @Get()
  findAll(@Req() req, @Query() query) {
    return this.conversationsService.findAll(req.tenantId, query)
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.conversationsService.findOne(req.tenantId, id)
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() body) {
    return this.conversationsService.update(req.tenantId, id, body)
  }

  @Post(':id/takeover')
  takeOver(@Req() req, @Param('id') id: string) {
    return this.conversationsService.takeOver(req.tenantId, id, req.userId)
  }

  @Post(':id/release-ai')
  releaseToAI(@Req() req, @Param('id') id: string) {
    return this.conversationsService.releaseToAI(req.tenantId, id)
  }

  @Get(':id/messages')
  getMessages(@Req() req, @Param('id') id: string, @Query() query) {
    return this.conversationsService.getMessages(req.tenantId, id, query)
  }

  @Post(':id/messages')
  @PlanMetric('conversations_month')
  @UseGuards(PlanGuard)
  sendMessage(@Req() req, @Param('id') id: string, @Body() body) {
    return this.conversationsService.sendManualMessage(req.tenantId, id, req.userId, body)
  }

  @Post(':id/notes')
  addNote(@Req() req, @Param('id') id: string, @Body() body) {
    return this.conversationsService.addNote(req.tenantId, id, req.userId, body.content)
  }
}
```

---

## MODULE 4 — AI Orchestration (RabbitMQ)

### `src/infrastructure/rabbitmq/rabbitmq.service.ts`

```typescript
@Injectable()
export class RabbitmqService implements OnModuleInit {
  private connection: amqp.Connection
  private channel: amqp.Channel

  async onModuleInit() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL!)
    this.channel = await this.connection.createChannel()

    // Déclarer les queues
    const queues = ['whatsapp.inbound', 'ai.tasks', 'ai.results', 'whatsapp.outbound', 'dlq.rejected']
    for (const queue of queues) {
      await this.channel.assertQueue(queue, { durable: true })
    }

    // Écouter ai.results (réponses du service FastAPI)
    this.channel.consume('ai.results', async (msg) => {
      if (!msg) return
      const result = JSON.parse(msg.content.toString())
      await this.handleAIResult(result)
      this.channel.ack(msg)
    })
  }

  async publish(queue: string, data: object) {
    const content = Buffer.from(JSON.stringify(data))
    this.channel.sendToQueue(queue, content, { persistent: true })
  }

  async handleAIResult(result: AIResult) {
    const { tenantId, conversationId, llmResponse, ttsUrl, hitlTriggered, hitlReason } = result

    // Sauvegarder ai_run en DB
    await supabase.from('ai_runs').insert({ ...result })

    if (hitlTriggered) {
      // Tag contact + note interne + notifier agents
      await supabase.from('conversations').update({
        status: 'pending_human',
        ai_active: false,
      }).eq('id', conversationId)

      await supabase.from('internal_notes').insert({
        tenant_id: tenantId,
        conversation_id: conversationId,
        content: `🤖 IA a transféré — Raison : ${hitlReason}`,
      })

      this.gateway.emitHITLTriggered(tenantId, { conversationId, reason: hitlReason })
      return
    }

    // Récupérer infos tenant pour envoyer via Meta
    const { data: conv } = await supabase
      .from('conversations')
      .select('contacts(wa_id, phone), tenants(wa_phone_id, meta_token)')
      .eq('id', conversationId)
      .single()

    // Publier sur whatsapp.outbound
    await this.publish('whatsapp.outbound', {
      tenantId,
      conversationId,
      toPhone: conv.contacts.phone,
      phoneId: conv.tenants.wa_phone_id,
      metaToken: conv.tenants.meta_token,
      textResponse: llmResponse,
      audioUrl: ttsUrl,  // null si mode vocal désactivé
    })

    // Notifier inbox temps réel
    this.gateway.emitConversationUpdated(tenantId, { id: conversationId, lastMessage: llmResponse })
  }
}
```

---

## MODULE 5 — E-Commerce

### `src/modules/ecommerce/youcan.client.ts`

```typescript
@Injectable()
export class YoucanClient {
  async getProducts(storeUrl: string, apiKey: string): Promise<Product[]> {
    const { data } = await axios.get(`${storeUrl}/api/v2/products`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    return data.data.map(p => ({
      external_id: p.id.toString(),
      platform: 'youcan',
      name: p.name,
      sku: p.sku || '',
      price: p.price,
      stock: p.stock_quantity || 0,
      image_url: p.images?.[0]?.url || null,
    }))
  }

  async getOrders(storeUrl: string, apiKey: string): Promise<Order[]> {
    const { data } = await axios.get(`${storeUrl}/api/v2/orders`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    return data.data.map(o => ({
      external_id: o.id.toString(),
      platform: 'youcan',
      status: this.mapStatus(o.status),
      total: o.total,
      items_json: o.items,
      address_json: o.shipping_address,
    }))
  }

  private mapStatus(status: string): string {
    const map = { '0': 'new', '1': 'confirmed', '2': 'shipped', '3': 'delivered', '4': 'cancelled' }
    return map[status] || 'new'
  }
}
```

### `src/modules/ecommerce/sync.service.ts`

```typescript
@Injectable()
export class SyncService {
  async syncTenant(tenantId: string) {
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .single()

    if (!integration) return

    let products = []
    let orders = []

    if (integration.platform === 'youcan') {
      products = await this.youcanClient.getProducts(integration.store_url, integration.access_token)
      orders = await this.youcanClient.getOrders(integration.store_url, integration.access_token)
    }
    // Même logique pour shopify, woocommerce

    // Upsert produits
    for (const p of products) {
      await supabase.from('products').upsert(
        { ...p, tenant_id: tenantId, synced_at: new Date().toISOString() },
        { onConflict: 'tenant_id,platform,external_id' }
      )
    }

    // Upsert commandes
    for (const o of orders) {
      await supabase.from('orders').upsert(
        { ...o, tenant_id: tenantId },
        { onConflict: 'tenant_id,platform,external_id' }
      )
    }

    return { products: products.length, orders: orders.length }
  }
}
```

---

## MODULE 6 — Billing (Stripe)

### `src/modules/billing/billing.service.ts`

```typescript
@Injectable()
export class BillingService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  async createCheckout(tenantId: string, plan: string, annual: boolean) {
    const prices = {
      solo:    { monthly: 'price_xxx_solo_m',   annual: 'price_xxx_solo_a' },
      pro:     { monthly: 'price_xxx_pro_m',    annual: 'price_xxx_pro_a' },
      agence:  { monthly: 'price_xxx_agence_m', annual: 'price_xxx_agence_a' },
    }
    const priceId = prices[plan][annual ? 'annual' : 'monthly']

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { tenantId },
      success_url: `${process.env.CORS_ORIGIN}/whatsapp/settings/billing?success=1`,
      cancel_url: `${process.env.CORS_ORIGIN}/whatsapp/settings/billing`,
    })

    return { url: session.url }
  }

  async createPortalSession(tenantId: string) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('tenant_id', tenantId)
      .single()

    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.CORS_ORIGIN}/whatsapp/settings/billing`,
    })

    return { url: session.url }
  }

  async handleStripeWebhook(body: string, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      body, signature, process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.syncSubscription(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await this.cancelSubscription(event.data.object as Stripe.Subscription)
        break
    }
  }
}
```

---

## MODULE 7 — main.ts (Bootstrap)

```typescript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,  // Nécessaire pour les webhooks Stripe (vérification signature)
  })

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })

  // Socket.io
  app.useWebSocketAdapter(new IoAdapter(app))

  // Validation globale
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // Rate limiting
  app.use(rateLimit({ windowMs: 1000, max: 100 }))

  await app.listen(process.env.PORT || 4000)
  console.log(`pretalkme API running on port ${process.env.PORT || 4000}`)
}
bootstrap()
```

---

## Variables d'env apps/api

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

RABBITMQ_URL=amqp://pretalkme:secret@localhost:5672
REDIS_URL=redis://localhost:6379

META_APP_SECRET=xxx
META_VERIFY_TOKEN=pretalkme_webhook_verify_2026
META_GRAPH_API_VERSION=v19.0

R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY=xxx
R2_SECRET_KEY=xxx
R2_BUCKET=pretalkme-media
R2_PUBLIC_URL=https://media.pretalk.me

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# CORS : autoriser uniquement app.pretalk.me
CORS_ORIGIN=https://app.pretalk.me
PORT=4000
```

---

## Résultat attendu

- `npm run start:dev` démarre sans erreur
- `GET /webhook/meta?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=yyy` → retourne `yyy`
- `POST /api/v1/conversations` avec JWT Supabase valide → liste conversations du tenant
- Socket.io : se connecter depuis le frontend → joindre la room tenant
- RabbitMQ : publier sur `ai.tasks` → consommer sur `ai.results` → envoyer via Meta

## Vérification

```bash
cd apps/api && npm run start:dev
# → NestJS démarre sur port 4000
curl http://localhost:4000/api/v1/conversations -H "Authorization: Bearer <jwt>"
# → { data: [], total: 0 }

curl http://localhost:4000/health
# → { "status": "ok", "service": "pretalkme-api" }
```

---

## ⚠️ Actions à faire par le propriétaire du projet (toi)

Une fois ce backend déployé par l'agent, voici les étapes **externes** que tu dois réaliser :

### Meta WhatsApp Business
```
□ 1. Aller sur developers.facebook.com → créer une app Meta de type "Business"
□ 2. Ajouter le produit "WhatsApp" à l'app
□ 3. Dans WhatsApp → Configuration :
     - Webhook URL : https://api.pretalk.me/webhook/meta
     - Verify Token : (valeur de META_VERIFY_TOKEN dans ton .env)
     - Souscrire aux événements : messages, message_deliveries, message_reads
□ 4. Générer un token système permanent (System User → Generate Token)
     - Ce token va dans META_TOKEN de chaque tenant dans Supabase
□ 5. Récupérer le App Secret → META_APP_SECRET dans .env
□ 6. Tester avec un numéro WhatsApp test fourni par Meta
```

### Stripe
```
□ 1. Créer un compte Stripe (stripe.com)
□ 2. Créer 3 produits : Solo (690 MAD), Pro (1490 MAD), Agence (3490 MAD)
     - Chaque produit a 2 prix : mensuel et annuel (-15%)
□ 3. Récupérer les Price IDs → les remplacer dans billing.service.ts (price_xxx_*)
□ 4. Dans Stripe → Webhooks → Ajouter endpoint :
     - URL : https://api.pretalk.me/billing/webhook
     - Événements : customer.subscription.created, updated, deleted
□ 5. Récupérer STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET → dans .env
□ 6. Activer le portail billing Stripe (Customer Portal → Settings)
     - Return URL : https://app.pretalk.me/whatsapp/settings/billing
```

### Cloudflare R2
```
□ 1. Dashboard Cloudflare → R2 → Créer bucket "pretalk-media"
□ 2. Créer des clés API R2 : R2_ACCESS_KEY et R2_SECRET_KEY
□ 3. Connecter le domaine media.pretalk.me au bucket (Custom Domain dans R2)
□ 4. Configurer la CORS policy (voir prompt 09)
```

### Documentation SYNC-GUIDE
```
□ Après déploiement, mettre à jour docs/SYNC-GUIDE.md avec :
  - URL API prod : https://api.pretalk.me
  - Toutes les queues RabbitMQ actives
  - Format des événements Socket.io implémentés
```


Also : 
pretalk.me
ID: 1661019488241194
Owned by: Pretalk App
Verify Domain
Select one option
Add a meta-tag
​
Add a meta-tag
Verify this domain by copying and pasting the provided meta-tag code into the <head> ... <head> section of your website's home page HTML code.
1. Copy this meta-tag: <meta name="facebook-domain-verification" content="vr95fygp20kcnwxq4v3quen5h74kzx" />
2. Paste the meta-tag into the <head>...</head> section of the website's home page HTML source, and publish the page.
Note: Verification will fail if the meta-tag code is outside of the <head> section or in a section loaded dynamically by JavaScript.
3. After you've published the home page, confirm that the meta-tag is visible by visiting http://pretalk.me/ and viewing the HTML source.
4. Click Verify domain
Note: It may take up to 72 hours for Facebook to find the meta-tag code. If the domain status is still not verified, you'll need to click Verify domain again or confirm the meta-tag is listed in the scrape results in the Sharing Debugger Tool.
