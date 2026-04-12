# AGENT 10 — Système Email Transactionnel (Resend)
> Mission : Implémenter tous les emails transactionnels de pretalkme.
> **Travail dans `apps/api/src/modules/email/`**

---

## Contexte

pretalkme doit envoyer des emails dans plusieurs situations :
- Invitation d'un agent à rejoindre l'équipe
- Notification HITL (un agent doit intervenir, il n'est pas connecté)
- Alerte quota plan presque atteint
- Confirmation d'abonnement / changement de plan
- Rapport hebdomadaire d'activité (optionnel — V2)

**Service email choisi : [Resend](https://resend.com)** — API simple, excellent délivrabilité, tier gratuit 3000 emails/mois.

---

## Structure

```
apps/api/src/modules/email/
├── email.module.ts
├── email.service.ts          ← Service principal (Resend SDK)
├── email.controller.ts       ← Pas d'endpoints publics, utilisé en interne
└── templates/
    ├── invitation.ts         ← Template invitation agent
    ├── hitl-alert.ts         ← Alerte HITL (agent requis)
    ├── quota-warning.ts      ← Alerte quota 80%
    ├── subscription.ts       ← Confirmation abonnement
    └── base.ts               ← Layout HTML commun
```

---

## `email.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common'
import { Resend } from 'resend'
import { renderInvitationEmail } from './templates/invitation'
import { renderHITLAlertEmail } from './templates/hitl-alert'
import { renderQuotaWarningEmail } from './templates/quota-warning'
import { renderSubscriptionEmail } from './templates/subscription'

@Injectable()
export class EmailService {
  private resend: Resend
  private readonly logger = new Logger(EmailService.name)
  private readonly FROM = 'pretalkme <noreply@pretalk.me>'

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  // ─── Invitation Agent ───────────────────────────────────

  async sendInvitation(params: {
    toEmail: string
    toName: string
    tenantName: string
    inviterName: string
    role: string
    inviteUrl: string
  }) {
    const { html, subject } = renderInvitationEmail(params)
    return this.send({ to: params.toEmail, subject, html })
  }

  // ─── Alerte HITL (agent offline) ─────────────────────────

  async sendHITLAlert(params: {
    agentEmail: string
    agentName: string
    contactName: string
    contactPhone: string
    reason: string
    conversationUrl: string
    tenantName: string
  }) {
    const { html, subject } = renderHITLAlertEmail(params)
    return this.send({ to: params.agentEmail, subject, html })
  }

  // ─── Alerte Quota ─────────────────────────────────────────

  async sendQuotaWarning(params: {
    ownerEmail: string
    ownerName: string
    metric: string        // 'conversations' | 'ai_credits'
    used: number
    limit: number
    plan: string
    upgradeUrl: string
  }) {
    const { html, subject } = renderQuotaWarningEmail(params)
    return this.send({ to: params.ownerEmail, subject, html })
  }

  // ─── Confirmation Abonnement ──────────────────────────────

  async sendSubscriptionConfirm(params: {
    ownerEmail: string
    ownerName: string
    plan: string
    amount: string
    billingDate: string
    manageUrl: string
  }) {
    const { html, subject } = renderSubscriptionEmail(params)
    return this.send({ to: params.ownerEmail, subject, html })
  }

  // ─── Envoi générique ──────────────────────────────────────

  private async send(params: { to: string; subject: string; html: string }) {
    try {
      const result = await this.resend.emails.send({
        from: this.FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      })
      this.logger.log(`Email sent to ${params.to}: ${params.subject}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to send email to ${params.to}: ${error.message}`)
      // Ne pas faire planter l'app si l'email échoue
      return null
    }
  }
}
```

---

## `templates/base.ts` — Layout HTML commun

```typescript
export function baseLayout(content: string, previewText: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>pretalkme</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: #16a34a; padding: 24px 32px; }
    .header img { height: 32px; }
    .logo-text { color: white; font-size: 20px; font-weight: 700; }
    .body { padding: 32px; }
    .body h1 { font-size: 22px; font-weight: 700; color: #111; margin: 0 0 16px; }
    .body p { font-size: 15px; color: #444; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #16a34a; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .badge { display: inline-block; background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .footer { padding: 20px 32px; background: #f9fafb; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 0; }
    .footer a { color: #6b7280; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="container">
    <div class="header">
      <span class="logo-text">pretalkme 🤖</span>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>pretalkme WhatsApp IA · <a href="https://pretalk.me">pretalk.me</a></p>
      <p>© ${new Date().getFullYear()} pretalkme. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
  `
}
```

---

## `templates/invitation.ts`

```typescript
import { baseLayout } from './base'

export function renderInvitationEmail(params: {
  toName: string
  tenantName: string
  inviterName: string
  role: string
  inviteUrl: string
}): { html: string; subject: string } {
  const roleLabel = { owner: 'Propriétaire', admin: 'Administrateur', agent: 'Agent', viewer: 'Observateur' }[params.role] || params.role

  const html = baseLayout(`
    <h1>Vous êtes invité !</h1>
    <p>Bonjour ${params.toName},</p>
    <p><strong>${params.inviterName}</strong> vous invite à rejoindre l'espace <strong>${params.tenantName}</strong> sur pretalkme en tant que :</p>
    <p><span class="badge">👤 ${roleLabel}</span></p>
    <p>pretalkme est une plateforme de vente sur WhatsApp avec un agent IA vocal qui comprend le Darija et le Français.</p>
    <a href="${params.inviteUrl}" class="btn">Accepter l'invitation →</a>
    <hr class="divider" />
    <p style="font-size:13px;color:#6b7280;">Ce lien expire dans 7 jours. Si vous n'attendiez pas cette invitation, ignorez cet email.</p>
  `, `${params.inviterName} vous invite sur pretalkme`)

  return {
    subject: `${params.inviterName} vous invite à rejoindre ${params.tenantName} sur pretalkme`,
    html,
  }
}
```

---

## `templates/hitl-alert.ts`

```typescript
import { baseLayout } from './base'

export function renderHITLAlertEmail(params: {
  agentName: string
  contactName: string
  contactPhone: string
  reason: string
  conversationUrl: string
  tenantName: string
}): { html: string; subject: string } {
  const html = baseLayout(`
    <h1>⚠️ Un client nécessite votre attention</h1>
    <p>Bonjour ${params.agentName},</p>
    <p>L'agent IA de <strong>${params.tenantName}</strong> a transféré une conversation à un agent humain :</p>
    <table style="width:100%;background:#fef9c3;border-radius:8px;padding:16px;margin:16px 0;">
      <tr><td style="padding:4px 0;"><strong>Client :</strong></td><td>${params.contactName} (${params.contactPhone})</td></tr>
      <tr><td style="padding:4px 0;"><strong>Raison :</strong></td><td>${params.reason}</td></tr>
    </table>
    <a href="${params.conversationUrl}" class="btn">Voir la conversation →</a>
    <hr class="divider" />
    <p style="font-size:13px;color:#6b7280;">Répondez dès que possible pour ne pas laisser le client en attente.</p>
  `, `Action requise : ${params.contactName} attend une réponse`)

  return {
    subject: `⚠️ [pretalkme] Action requise : ${params.contactName} attend votre réponse`,
    html,
  }
}
```

---

## `templates/quota-warning.ts`

```typescript
import { baseLayout } from './base'

export function renderQuotaWarningEmail(params: {
  ownerName: string
  metric: string
  used: number
  limit: number
  plan: string
  upgradeUrl: string
}): { html: string; subject: string } {
  const metricLabel = { conversations: 'conversations', ai_credits: 'crédits IA', broadcasts: 'campagnes' }[params.metric] || params.metric
  const pct = Math.round((params.used / params.limit) * 100)

  const html = baseLayout(`
    <h1>Votre quota est presque atteint</h1>
    <p>Bonjour ${params.ownerName},</p>
    <p>Vous avez utilisé <strong>${pct}%</strong> de votre quota de <strong>${metricLabel}</strong> ce mois-ci :</p>
    <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;">
      <div style="background:#e5e7eb;border-radius:4px;height:8px;">
        <div style="background:#16a34a;border-radius:4px;height:8px;width:${pct}%;"></div>
      </div>
      <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">${params.used} / ${params.limit} ${metricLabel} · Plan ${params.plan}</p>
    </div>
    <p>Pour continuer à utiliser pretalkme sans interruption, passez à un plan supérieur.</p>
    <a href="${params.upgradeUrl}" class="btn">Mettre à niveau →</a>
  `, `Quota ${metricLabel} à ${pct}%`)

  return {
    subject: `[pretalkme] Quota ${metricLabel} : ${pct}% utilisé`,
    html,
  }
}
```

---

## `templates/subscription.ts`

```typescript
import { baseLayout } from './base'

export function renderSubscriptionEmail(params: {
  ownerName: string
  plan: string
  amount: string
  billingDate: string
  manageUrl: string
}): { html: string; subject: string } {
  const planLabel = { solo: 'Agent Solo', pro: 'Machine de Vente', agence: 'Directeur Commercial' }[params.plan] || params.plan

  const html = baseLayout(`
    <h1>✅ Abonnement confirmé</h1>
    <p>Bonjour ${params.ownerName},</p>
    <p>Votre abonnement pretalkme a été activé avec succès.</p>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;"><strong>Plan :</strong> ${planLabel}</p>
      <p style="margin:4px 0;"><strong>Montant :</strong> ${params.amount}</p>
      <p style="margin:0;"><strong>Prochain renouvellement :</strong> ${params.billingDate}</p>
    </div>
    <p>Votre agent IA WhatsApp est maintenant actif et prêt à vendre pour vous.</p>
    <a href="https://app.pretalk.me/whatsapp/inbox" class="btn">Accéder à mon inbox →</a>
    <hr class="divider" />
    <a href="${params.manageUrl}" style="font-size:13px;color:#6b7280;">Gérer mon abonnement</a>
  `, `Bienvenue sur le plan ${planLabel}`)

  return {
    subject: `✅ [pretalkme] Abonnement ${planLabel} activé`,
    html,
  }
}
```

---

## Intégration avec les autres modules NestJS

### Dans `conversations.service.ts` — alerte HITL

```typescript
// Quand HITL est déclenché et que l'agent n'est pas connecté :
async notifyAgentOffline(tenantId: string, conversationId: string, agentId: string, reason: string) {
  const { data: agent } = await supabase.from('users').select('email, name').eq('id', agentId).single()
  const { data: conv } = await supabase.from('conversations').select('contacts(name, phone)').eq('id', conversationId).single()
  const { data: tenant } = await supabase.from('tenants').select('name').eq('id', tenantId).single()

  await this.emailService.sendHITLAlert({
    agentEmail: agent.email,
    agentName: agent.name,
    contactName: conv.contacts.name || conv.contacts.phone,
    contactPhone: conv.contacts.phone,
    reason,
    conversationUrl: `https://app.pretalk.me/whatsapp/inbox/${conversationId}`,
    tenantName: tenant.name,
  })
}
```

### Dans `billing.service.ts` — confirmation abonnement

```typescript
// Dans handleStripeWebhook, après customer.subscription.created :
await this.emailService.sendSubscriptionConfirm({
  ownerEmail: owner.email,
  ownerName: owner.name,
  plan: subscription.plan,
  amount: `${amount} MAD/mois`,
  billingDate: format(new Date(subscription.current_period_end * 1000), 'dd/MM/yyyy'),
  manageUrl: portalUrl,
})
```

### Dans `plan.guard.ts` — alerte quota 80%

```typescript
// Quand used/limit >= 0.8, envoyer l'email (une seule fois par mois via flag Redis) :
const key = `quota_warned:${tenantId}:${metric}:${month}`
const alreadyWarned = await redis.get(key)
if (!alreadyWarned && used / limit >= 0.8) {
  await redis.set(key, '1', 'EX', 86400 * 30)  // 30 jours
  await emailService.sendQuotaWarning({ ... })
}
```

---

## Variable d'env à ajouter dans apps/api

```env
RESEND_API_KEY=re_xxx
```

---

## Vérification

```bash
# Test manuel depuis NestJS :
# Ajouter un endpoint de test temporaire (retirer en prod) :
@Get('email/test-hitl')
async testHITL() {
  await this.emailService.sendHITLAlert({
    agentEmail: 'ton@email.com',
    agentName: 'Khalid',
    contactName: 'Ahmed El Fassi',
    contactPhone: '+212612345678',
    reason: 'Réclamation détectée — mot-clé "remboursement"',
    conversationUrl: 'https://app.pretalk.me/whatsapp/inbox/test-123',
    tenantName: 'Ma Boutique',
  })
  return { sent: true }
}

curl http://localhost:4000/email/test-hitl
# → Vérifier la réception de l'email
```

---

## ⚠️ Actions à faire par le propriétaire du projet (toi)

### Resend
```
□ 1. Créer un compte sur resend.com
□ 2. API Keys → Create API Key → Copier la clé → RESEND_API_KEY dans .env
□ 3. Domains → Add Domain → "pretalk.me"
     - Resend va demander d'ajouter des DNS records dans Cloudflare
     - Ajouter les records MX, TXT (DKIM), TXT (SPF) fournis par Resend
     - Vérifier le domaine dans Resend (peut prendre quelques minutes)
□ 4. Une fois le domaine vérifié, les emails partent depuis "noreply@pretalk.me"
```

### DNS Cloudflare (pour Resend)
```
□ Resend va fournir des records à ajouter dans Cloudflare DNS :
  - TXT record pour SPF
  - TXT record pour DKIM (2 records)
  - MX record (si vous voulez recevoir des emails)
□ Important : Ces records sont sur le domaine racine pretalk.me
  → Vérifier que ça ne conflict pas avec les records existants
```

### Documentation SYNC-GUIDE
```
□ Mettre à jour docs/SYNC-GUIDE.md avec :
  - Service email : Resend
  - From : noreply@pretalk.me
  - Liste des emails implémentés et leurs triggers
```
