# ✉️ TL;DR - Emails sans Brevo Builder (Version Simple)

**La bonne nouvelle:** Vous pouvez envoyer des emails avec Brevo **sans créer 28 templates dans Brevo dashboard!**

---

## 🎯 Comment ça marche en 3 étapes

### 1️⃣ Créer un fichier HTML

**Fichier:** `src/templates/emails/delivery_audit.fr.html`

```html
<!-- subject: 📊 Mon sujet du mail -->

<!DOCTYPE html>
<html>
<body>
  <h1>Bonjour {{nom_client}}</h1>
  <p>Votre audit est prêt: {{audit_summary}}</p>
  <a href="{{audit_url}}">👁️ Voir l'audit</a>
</body>
</html>
```

**C'est tout!** Pas besoin d'aller sur Brevo dashboard.

### 2️⃣ Utiliser dans le code backend

```typescript
const result = await brevoEmailService.sendByEventType({
  event_type: 'delivery_audit',              // Nom du template (pas d'ID!)
  recipient_email: 'client@example.com',
  locale: 'fr',
  template_params: {
    nom_client: 'Jean',
    audit_url: 'https://...',
    audit_summary: '5 points clés'
  }
});
```

### 3️⃣ Email envoye via Brevo API

- Variables remplacées (`{{nom_client}}` → "Jean")
- Branding auto-injecté
- Email envoyé via Brevo
- Logué dans la base de données

**Done! ✅**

---

## 🎁 Ce qui est Inclus

### Services (Prêts à utiliser)

```
✅ src/server/services/emailTemplateService.ts
✅ src/server/services/brevoEmailService_v2.ts
```

### Templates (Exemples fournis)

```
✅ delivery_audit.fr.html
✅ delivery_audit.en.html
✅ delivery_proposition.fr.html
✅ kickoff_ready.fr.html
```

### Documentation (Complète)

```
✅ docs/EMAIL_NO_BREVO_BUILDER.md (450 lignes)
✅ docs/TEMPLATES_EDITING_GUIDE.md (400 lignes)
✅ docs/MIGRATE_FROM_BREVO_BUILDER.md (330 lignes)
```

---

## ❓ FAQ Rapide

### Q: Dois-je supprimer les templates Brevo?

**R:** Non! Les deux approches marchent ensemble. Vous pouvez utiliser local templates ET Brevo Builder templates.

### Q: Ça prend combien de temps d'ajouter un nouveau template?

**R:** 5 minutes! Créer un fichier HTML + ajouter variables.

### Q: Qui peut éditer les templates?

**R:** N'importe qui avec accès au repo (pas besoin de Brevo account).

### Q: Les emails sont-ils loggés?

**R:** Oui, tout va dans la table `email_send_logs`.

### Q: Ça coûte plus cher?

**R:** Non! Ça économise l'espace de stockage template Brevo.

---

## 🚀 Test Rapide (2 min)

```bash
# 1. Démarrer backend
npm run dev:server

# 2. Tester
curl -X POST http://localhost:8787/api/email/send-template \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "event_type": "delivery_audit",
    "recipient_email": "vous@example.com",
    "template_params": {"nom_client": "Test"}
  }'

# 3. Vérifier inbox
# Email devrait arriver en quelques secondes
```

---

## 📝 Structure d'un Template

```html
<!-- subject: 📊 {{brand_name}} - Votre message -->
    ↑ SUJET (éditable)

<!DOCTYPE html>
<html>
<head>
  <style>
    /* CSS = Design */
  </style>
</head>
<body>
  <!-- Contenu= Body -->
  <p>Bonjour {{variable}}</p>
</body>
</html>
```

---

## 🔤 Variables Utiles

```html
<!-- BRANDING (Auto-injected) -->
{{brand_name}}           → "Pretalk"
{{brand_logo_url}}       → Logo URL
{{brand_primary_color}}  → Couleur primaire

<!-- PERSONNALISÉES (Vous les choisissez) -->
{{nom_client}}
{{nom_consultant}}
{{email}}
{{url_action}}
```

---

## 🔄 Vielle Approche vs Nouvelle

| | Ancienne (Brevo Builder) | Nouvelle (Local) |
|---|---|---|
| Où? | Dashboard Brevo | Fichiers .html dans repo |
| Combien? | 28 templates = 28 env vars | 0 env vars |
| Versionning? | ❌ Non | ✅ Oui (Git) |
| QA? | ❌ Manual cliques | ✅ Code review |
| Coût? | $$$ | FREE |
| Edit? | UI Brevo | VS Code |

---

## ✨ 3 Façons d'Envoyer

```typescript
// NOUVELLE (Recommandée)
await brevoEmailService.sendByEventType({
  event_type: 'delivery_audit',
  recipient_email: 'client@example.com',
  template_params: { ... }
});

// ANCIENNE (Si vous préférez)
await brevoEmailService.sendWithTemplateId({
  templateId: 20,
  to: [{ email: 'client@example.com' }],
  params: { ... }
});

// CUSTOM (Cas spéciaux)
await brevoEmailService.sendCustomHtml({
  to: [...],
  htmlContent: '<h1>...</h1>'
});
```

---

## 📋 Templates à Créer

**Fournis (4):**
- ✅ delivery_audit (FR, EN)
- ✅ delivery_proposition (FR)
- ✅ kickoff_ready (FR)

**À créer (optionnel):**
- new_lead.{locale}.html
- proposal_follow_up.{locale}.html
- contract_signed.{locale}.html
- onboarding_welcome.{locale}.html
- lead_qualified.{locale}.html

---

## 🎨 Éditer un Template (Facile)

### Changer le sujet

```html
<!-- subject: 📊 {{brand_name}} - Votre audit est prêt -->
                 ↑ Edit ceci
```

### Changer les couleurs

```html
<style>
  .header { background: {{brand_primary_color}}; }
  .button { background: {{brand_secondary_color}}; }
</style>
```

### Changer le texte

```html
<p>Bonjour {{nom_client}}</p>
↓ Devenir:
<p>Bienvenue {{nom_client}}! 👋</p>
```

---

## 🚨 Important (Blocker)

**Lead Actions Hub** utilise encore SendGrid (pas Brevo).

À fixer:
```bash
bash scripts/fix_lead_actions_sendgrid.sh
# Choisir Option A (Backend API)
```

Référence: [docs/CRITICAL_BLOCKER_LEAD_ACTIONS_SENDGRID.md](../CRITICAL_BLOCKER_LEAD_ACTIONS_SENDGRID.md)

---

## 📚 Où Lire Plus

1. **Complet:** [docs/EMAIL_NO_BREVO_BUILDER.md](./EMAIL_NO_BREVO_BUILDER.md)
2. **Non-tech:** [docs/TEMPLATES_EDITING_GUIDE.md](./TEMPLATES_EDITING_GUIDE.md)
3. **Migration:** [docs/MIGRATE_FROM_BREVO_BUILDER.md](./MIGRATE_FROM_BREVO_BUILDER.md)

---

## ✅ Checklist Rapide

- [x] Services créés
- [x] Templates exemples créés
- [x] Documentation complète
- [ ] Tester `npm run dev:server` + curl
- [ ] Créer autres templates (si besoin)
- [ ] Fixer Lead Actions blocker

---

**C'est prêt! Vous pouvez envoyer des emails sans Brevo Builder. 🚀**

Questions? Lire la [documentation complète](./EMAIL_NO_BREVO_BUILDER.md).
