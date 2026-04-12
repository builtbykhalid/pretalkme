# 📧 NO-BREVO-BUILDER APPROACH - Envoyer des Emails sans Templates Brevo

**Status:** ✅ RECOMMENDED APPROACH  
**Avantages:** Pas de 28 templates Brevo Builder à maintenir, templates versionnés avec le code  
**Non-Bloquant:** Vous pouvez encore utiliser les Brevo Builder templates si vous préférez

---

## 🎯 3 Approches Disponibles

### Approche 1: Custom HTML (RECOMMANDÉE - NOUVEAU)

```typescript
// ✅ BEST: Templates locaux, pas de Brevo Dashboard needed
await brevoEmailService.sendByEventType({
  event_type: 'delivery_audit',
  recipient_email: 'client@example.com',
  recipient_name: 'Jean Dupont',
  locale: 'fr',
  template_params: {
    audit_url: 'https://app.pretalk.me/audit/123',
    audit_summary: '10 actions clés identifiées',
    nom_consultant: 'Marie Martin',
    nom_entreprise: 'Acme SAS',
  }
});
```

**Fichiers utilisés:**
- `src/templates/emails/delivery_audit.fr.html` ← Fichier local
- `src/server/services/emailTemplateService.ts` ← Charge templates
- `src/server/services/brevoEmailService_v2.ts` ← Envoie via Brevo API

---

### Approche 2: Brevo Builder Template (Ancienne)

```typescript
// ⚠️ STILL WORKS: Utilise Brevo dashboard (28 templates à maintenir)
await brevoEmailService.sendWithTemplateId({
  templateId: 20, // Brevo template ID
  to: [{ email: 'client@example.com', name: 'Jean Dupont' }],
  params: {
    audit_url: 'https://app.pretalk.me/audit/123',
    nom_consultant: 'Marie Martin',
  }
});
```

---

### Approche 3: HTML Directement

```typescript
// Direct HTML (utile pour cas spéciaux)
await brevoEmailService.sendCustomHtml({
  to: [{ email: 'client@example.com', name: 'Jean Dupont' }],
  subject: 'Mon email personnel',
  htmlContent: '<h1>Bonjour!</h1><p>Ceci est mon email...</p>',
  textContent: 'Bonjour! Ceci est mon email...',
});
```

---

## 🚀 SETUP

### Step 1: Templates sont déjà là

Templates locaux créés:
- ✅ `src/templates/emails/delivery_audit.fr.html`
- ✅ `src/templates/emails/delivery_audit.en.html`
- ✅ `src/templates/emails/delivery_proposition.fr.html`
- ✅ `src/templates/emails/kickoff_ready.fr.html`

### Step 2: Créer plus de templates

Créer nouveau fichier: `src/templates/emails/{event_type}.{locale}.html`

Format du fichier:
```html
<!-- subject: Mon sujet avec {{variables}} -->

<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <!-- Email body avec {{variables}} -->
  <h1>Bonjour {{nom_client}}</h1>
  <p>Bienvenue sur {{brand_name}}</p>
  <a href="{{action_url}}">Cliquez ici</a>
</body>
</html>
```

### Step 3: Utiliser dans le code

```typescript
import { brevoEmailService } from '../services/brevoEmailService_v2';

// Dans emailRoutes.ts ou n'importe où
const result = await brevoEmailService.sendByEventType({
  event_type: 'delivery_audit',
  recipient_email: req.body.recipient_email,
  locale: req.body.locale || 'fr',
  template_params: {
    nom_client: lead.nom_client,
    nom_consultant: 'Marie Martin',
    audit_url: `https://app.pretalk.me/audit/${leadId}`,
    audit_summary: lead.audit_summary,
  }
});
```

---

## 📝 Variables Disponibles dans Templates

### Variables Branding (Auto-Injectées)

Ces variables sont **TOUJOURS** disponibles:

```html
{{brand_name}}              <!-- "Pretalk" -->
{{brand_logo_url}}          <!-- https://cdn.pretalk.me/logo.png -->
{{brand_primary_color}}     <!-- #0D3B66 -->
{{brand_secondary_color}}   <!-- #1782C5 -->
{{brand_support_email}}     <!-- support@pretalk.me -->
```

### Variables Personnalisées (Par Template)

#### `delivery_audit.{locale}.html`
```
nom_client
nom_consultant
nom_entreprise
audit_url
audit_summary
```

#### `delivery_proposition.{locale}.html`
```
nom_client
nom_consultant
nom_entreprise
proposal_url
proposal_count
```

#### `kickoff_ready.{locale}.html`
```
nom_client
nom_consultant
kickoff_url
kickoff_date
kickoff_time
```

---

## 🎨 Customiser les Templates

### Ajouter des styles CSS

Les templates utilisent CSS inline:

```html
<style>
  .button {
    background: {{brand_primary_color}};
    padding: 12px 30px;
    border-radius: 5px;
  }
</style>
```

### Utiliser les couleurs branding

```html
<div style="border-left: 4px solid {{brand_secondary_color}};">
  Contenu important
</div>

<a style="background: {{brand_primary_color}}" href="{{action_url}}">
  Call to Action
</a>
```

### Filtres disponibles

Dans les templates, vous pouvez utiliser des filtres:

```html
{{nom_client | uppercase}}      <!-- JEAN DUPONT -->
{{nom_client | capitalize}}     <!-- Jean dupont -->
{{total | currency}}             <!-- 1,234.56 € -->
{{date_debut | date:'fr'}}       <!-- 26/03/2026 -->
```

---

## ✅ Migration depuis Brevo Builder

Si vous utilisiez déjà des Brevo Builder templates:

### Option 1: Garder les deux

```typescript
// Continue to use templateId
await brevoEmailService.sendWithTemplateId({ ... });

// ET commencez à utiliser local templates
await brevoEmailService.sendByEventType({ ... });
```

### Option 2: Migrer vers Local Templates

1. Exporter HTML depuis Brevo dashboard
2. Créer fichier `src/templates/emails/{name}.{locale}.html`
3. Ajouter balise `<!-- subject: ... -->` au top
4. Mettre à jour appels code: `sendWithTemplateId` → `sendByEventType`

---

## 🔄 Workflow Backend API `sendByEventType`

```
1. Frontend/n8n appelle:
   POST /api/email/send-template
   { event_type: 'delivery_audit', ... }

2. emailRoutes.ts reçoit request

3. Appelle brevoEmailService.sendByEventType()

4. emailTemplateService charge:
   src/templates/emails/delivery_audit.fr.html

5. renderTemplate() remplace les variables:
   {{nom_client}} → "Jean Dupont"
   {{brand_name}} → "Pretalk"
   etc.

6. Envoie à Brevo API avec HTML compilé

7. Email arrive dans inbox!
```

---

## 📊 Exemple Complet: LeadReview

```typescript
// src/components/ReactApp/pages/LeadReview.tsx

import { sendAppTemplateEmail } from '../lib/emailApi';

async function sendAudit() {
  const result = await sendAppTemplateEmail({
    event_type: 'delivery_audit',
    recipient_email: lead.email,
    recipient_name: lead.nom_client,
    template_params: {
      audit_url: `https://app.pretalk.me/audit/${leadId}`,
      audit_summary: '5 opportunités identifiées',
      nom_consultant: 'Marie Martin',
      nom_entreprise: lead.nom_entreprise,
    }
  });
  
  if (result.success) {
    toast.success('Email envoyé!');
  }
}
```

```typescript
// src/server/routes/emailRoutes.ts

app.post('/api/email/send-template', async (req, res) => {
  const payload = req.body;
  
  // Method: Use local template (NO Brevo Builder needed!)
  const result = await brevoEmailService.sendByEventType({
    event_type: payload.event_type,
    recipient_email: payload.recipient_email,
    locale: payload.locale || 'fr',
    template_params: payload.template_params,
  });
  
  // Log to database
  await supabase.from('email_send_logs').insert({
    event_type: payload.event_type,
    template_params: payload.template_params,
    ...
  });
  
  res.json({ success: true, ...result });
});
```

---

## 🧪 Test Local

Créer un fichier test `src/templates/emails/test.fr.html`:

```html
<!-- subject: Test Email -->
<!DOCTYPE html>
<html>
<body>
  <h1>Test {{brand_name}}</h1>
  <p>Hello {{name}}</p>
</body>
</html>
```

Tester:

```bash
cd src/server
npm run dev:server

# Dans autre terminal:
curl -X POST http://localhost:8787/api/email/send-template \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test",
    "recipient_email": "you@example.com",
    "template_params": {"name": "Jean"}
  }'
```

**Réponse:**
```json
{
  "success": true,
  "email_id": "abc123",
  "log_id": "log-123"
}
```

---

## 🎁 Bonus: Template Management

### Lister tous les templates

```typescript
import { emailTemplateService } from '@/server/services/emailTemplateService';

const templates = await emailTemplateService.listTemplates();
console.log(templates);
// ['delivery_audit.fr.html', 'delivery_audit.en.html', ...]
```

### Recharger templates après édition

```typescript
// Après modification des fichiers .html
await emailTemplateService.reloadTemplates();
```

### Valider template

```typescript
const template = await emailTemplateService.getTemplate('delivery_audit', 'fr');
const isValid = emailTemplateService.validateTemplate(template, [
  'nom_client',
  'auditurl',
  'nom_consultant'
]);
```

---

## 📋 Checklist Implémentation

- [ ] Services créés:
  - ✅ `src/server/services/emailTemplateService.ts`
  - ✅ `src/server/services/brevoEmailService_v2.ts`

- [ ] Templates créés:
  - ✅ `delivery_audit.fr.html`
  - ✅ `delivery_audit.en.html`
  - ✅ `delivery_proposition.fr.html`
  - ✅ `kickoff_ready.fr.html`

- [ ] À faire:
  - [ ] Créer autres templates (new_lead, proposal_follow_up, etc.)
  - [ ] Mettre à jour emailRoutes.ts pour utiliser `sendByEventType`
  - [ ] Tester avec npm run dev:server
  - [ ] Supprimer les 28 env vars pour Brevo template IDs (optionnel!)

---

## 🎯 Benefits vs Brevo Builder

| Aspect | Brevo Builder Templates | Local Templates (Notre Approche) |
|--------|------------------------|----------------------------------|
| Maintenance | 28 templates în dashboard | Templates dans repo |
| Versioning | Manual tracking | Git history |
| QA/Review | Manual clicks | Code review |
| Localizations | Separate templates | Chained naming |
| Variables | Pre-defined | Any you want |
| Styling | Brevo editor | Full CSS control |
| Deployment | Manual sync | Auto with code |
| Cost | $$ per template stored | FREE |

---

**Vous pouvez commencer**Toutes les 3 approches marchent! Recommandation: `sendByEventType` pour la flexibilité maximum. 🚀
