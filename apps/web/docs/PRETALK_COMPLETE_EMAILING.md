# Pretalk - Emailing complet (etat actuel)

Date: 2026-03-26

## Source de verite

- Tous les envois email applicatifs doivent passer par le backend: `POST /api/email/send-template`
- Exceptions explicites: emails Supabase Auth (creation de compte, reset password, magic link, invitation)

## Templates transactionnels Pretalk (backend)

Event types supportes:
- `new_lead`
- `delivery_audit`
- `delivery_proposition`
- `onboarding_welcome`
- `proposal_follow_up`
- `contract_signed`
- `kickoff_ready`

Fichier source backend:
- `src/server/services/brevoEmailService.ts`

## Branding unifie Pretalk

Le backend injecte automatiquement des variables branding communes dans chaque envoi:
- `brand_name`
- `brand_tagline`
- `brand_logo_url`
- `brand_primary_color`
- `brand_secondary_color`
- `brand_accent_color`
- `brand_text_color`
- `brand_support_email`

Template HTML unifie Pretalk (base visuelle):
- `docs/PRETALK_UNIFIED_EMAIL_TEMPLATE.html`

## Flux actifs cibles

### Funnel client
- Envoi audit: backend (`delivery_audit`)
- Envoi proposition: backend (`delivery_proposition`)
- Envoi kickoff: backend (`kickoff_ready`)

### Admin / operations
- Logs email: table `email_send_logs`
- Stats email: `GET /api/email/stats`
- Health service: `GET /api/email/health`

### Auth (exception)
- Signup / confirmation
- Password reset
- Magic link
- Invite

Ces emails restent geres cote Supabase Auth.

## Points de controle

- Le frontend doit inclure `lead_id` sur les envois pour les checks de permission backend.
- Les actions d'email via webhooks n8n ne doivent plus etre utilisees par les composants UI.
- Les workflows n8n peuvent rester utilises pour generation metier (audit, devis, contrat), sans etre la source d'envoi email.

## Variables d'environnement recommandees

Backend:
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_BRAND_LOGO_URL` (optionnel, fallback Pretalk par defaut)

Frontend:
- `VITE_BACKEND_BASE_URL` (optionnel si backend sur meme origine)
