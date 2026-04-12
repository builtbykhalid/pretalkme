# 🔄 MIGRATION GUIDE - De Brevo Builder à Local Templates

**Status:** OPTIONAL (Les deux approches peuvent coexister)  
**Durée:** 30 minutes (une fois que vous comprenez)  
**Bénéfice:** Zéro dépendance à Brevo dashboard, templates dans le repo

---

## 📊 Avant vs Après

### ❌ Avant: Brevo Builder Templates (28 templates à maintenir)

```
1. Créer 28 templates dans Brevo dashboard
2. Copier chaque template ID
3. Ajouter 28 env vars: BREVO_TEMPLATE_DELIVERY_AUDIT_FR=20
4. Mettre à jour les templates → logguer dans Brevo
5. Synchroniser manuellement entre dashboard et ...?
```

**Code:**
```typescript
// emailRoutes.ts
const result = await brevoEmailService.sendWithTemplateId({
  templateId: 20,  // Brevo dashboard template ID
  to: [{ email: 'client@example.com' }],
  params: { nom_client: 'Jean' }
});
```

---

### ✅ Après: Local Templates (0 templates Brevo dashboard)

```
1. Créer fichiers HTML dans repo: src/templates/emails/
2. Ajouter subject dans HTML: <!-- subject: ... -->
3. Format: {event_type}.{locale}.html
4. Done! Zéro configuration
```

**Code:**
```typescript
// emailRoutes.ts  (NOUVEAU)
const result = await brevoEmailService.sendByEventType({
  event_type: 'delivery_audit',  // Event type
  recipient_email: 'client@example.com',
  template_params: { nom_client: 'Jean' }
});
```

---

## 🔀 Migration Step-by-Step

### Step 1: Exporter les Templates Brevo

Pour chaque template Brevo Builder:

1. Aller à https://app.brevo.com/email/template/
2. Ouvrir le template
3. Copier le HTML (Click: "Edit" → "Source Code")
4. Sauvegarder dans fichier local

**Exemple:**

```html
<!-- Copié depuis Brevo template 20 -->
<h1>Your audit is ready</h1>
<p>Hello {{params.nom_client}}</p>
```

### Step 2: Créer fichiers HTML locaux

Créer fichier: `src/templates/emails/delivery_audit.fr.html`

```html
<!-- subject: 📊 {{brand_name}} - Votre audit est prêt -->

<!DOCTYPE html>
<html>
<head>
  <style>
    /* Coller les styles du template Brevo ici */
  </style>
</head>
<body>
  <!-- Coller le HTML Brevo ici -->
  <!-- REMPLACER: {{params.xxx}} → {{xxx}} -->
  <h1>Votre audit est prêt</h1>
  <p>Bonjour {{nom_client}}</p>
</body>
</html>
```

**Important:** Remplacer `{{params.xxx}}` par `{{xxx}}`

### Step 3: Mettre à jour le Code

**Avant:**
```typescript
// Utilise templateId et env vars
const templateId = parseInt(process.env.BREVO_TEMPLATE_DELIVERY_AUDIT_FR!);

const result = await brevoEmailService.sendWithTemplateId({
  templateId,
  to: [{ email: lead.email }],
  params: {
    nom_client: lead.nom_client,
  }
});
```

**Après:**
```typescript
// Utilise event_type et local template
const result = await brevoEmailService.sendByEventType({
  event_type: 'delivery_audit',
  recipient_email: lead.email,
  locale: 'fr',
  template_params: {
    nom_client: lead.nom_client,
  }
});
```

### Step 4: Supprimer env vars (Optionnel)

**Avant** (28 vars):
```bash
BREVO_TEMPLATE_DELIVERY_AUDIT_FR=20
BREVO_TEMPLATE_DELIVERY_AUDIT_EN=21
BREVO_TEMPLATE_DELIVERY_AUDIT_ES=22
BREVO_TEMPLATE_DELIVERY_AUDIT_AR=23
BREVO_TEMPLATE_DELIVERY_PROPOSITION_FR=30
... (24 others)
```

**Après** (0 vars pour templates):
```bash
# Templates sont dans src/templates/emails/
# Pas besoin de BREVO_TEMPLATE_* env vars!
```

### Step 5: Tester

```bash
npm run dev:server

# Test
curl -X POST http://localhost:8787/api/email/send-template \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "event_type": "delivery_audit",
    "recipient_email": "test@example.com",
    "template_params": {"nom_client": "Jean"}
  }'

# Vérifier que l'email arrive
```

---

## 🔀 Coexistance: Utiliser les DEUX

Vous pouvez utiliser les deux approches simultanément!

```typescript
// Vieux code: Continue avec Brevo Builder templates
const result1 = await brevoEmailService.sendWithTemplateId({
  templateId: 20,
  ...
});

// Nouveau code: Utilise local templates
const result2 = await brevoEmailService.sendByEventType({
  event_type: 'delivery_audit',
  ...
});

// Les deux marchent! Migrer progressivement.
```

---

## 📋 Migration Checklist

Pour chaque template:

- [ ] Export HTML depuis Brevo Builder
- [ ] Créer fichier `src/templates/emails/{event_type}.{locale}.html`
- [ ] Ajouter comment subject au top: `<!-- subject: ... -->`
- [ ] Remplacer `{{params.xxx}}` par `{{xxx}}`
- [ ] Tester: curl POST /api/email/send-template
- [ ] Vérifier email reçu avec branding correct
- [ ] Mettre à jour appels code: `sendWithTemplateId` → `sendByEventType`
- [ ] Retirer env var `BREVO_TEMPLATE_*` (optionnel)

---

## 🎯 Templates à Migrer

Pour atteindre 100% local templates (0 Brevo templates):

| Event Type | FR | EN | ES | AR | Status |
|-----------|----|----|----|----|--------|
| delivery_audit | ✅ | ✅ | ⏳ | ⏳ | 50% done |
| delivery_proposition | ✅ | ⏳ | ⏳ | ⏳ | 33% done |
| kickoff_ready | ✅ | ⏳ | ⏳ | ⏳ | 33% done |
| new_lead | ⏳ | ⏳ | ⏳ | ⏳ | TODO |
| proposal_follow_up | ⏳ | ⏳ | ⏳ | ⏳ | TODO |
| contract_signed | ⏳ | ⏳ | ⏳ | ⏳ | TODO |
| onboarding_welcome | ⏳ | ⏳ | ⏳ | ⏳ | TODO |
| lead_qualified | ⏳ | ⏳ | ⏳ | ⏳ | TODO |

**Estimated Effort:** 2-3 heures (si templates Brevo existent déjà)

---

## 🎨 Template Customization

Après migration, vous pouvez customizer:

### Styles

```html
<style>
  .header { background: {{brand_primary_color}}; }
  .button { background: {{brand_secondary_color}}; }
</style>
```

### Conditional Logic

```html
{{#if premium_tier}}
  <p>Exclusive premium features...</p>
{{/if}}
```

### Loops

```html
{{#each action_items}}
  <li>{{this}}</li>
{{/each}}
```

### Filters

```html
{{date_now | date:'fr'}}           <!-- 26/03/2026 -->
{{total_amount | currency}}        <!-- 1,234.56 € -->
{{company_name | uppercase}}       <!-- ACME SAS -->
```

---

## 🚀 Avantages de la Migration

| Point | Brevo Builder | Local Templates |
|-------|--------------|-----------------|
| Centralisation | ❌ Dashboard Brevo | ✅ Git repo |
| Versioning | ❌ Manual | ✅ Git history |
| QA/Review | ❌ Manual clicks | ✅ Code review |
| Sync | ❌ Manual | ✅ Automatic |
| Cost | $$$ (template storage) | FREE |
| Deployment | ❌ Manual | ✅ Auto deploy |
| Branding | ⚠️ Inconsistent | ✅ Centralized |
| Flexibility | ❌ Limited | ✅ Full CSS/JS |

---

## ⚡ Quick Migration Script

Pour accélérer (dans le futur):

```bash
# Créer template local depuis Brevo export
./scripts/migrate-brevo-template.sh \
  --brevo-id 20 \
  --event-type delivery_audit \
  --locale fr \
  --html-file /tmp/template-20.html

# Génère automatiquement:
# src/templates/emails/delivery_audit.fr.html
```

---

## 🆚 Comparison Table

```
BREVO BUILDER TEMPLATES              LOCAL TEMPLATES
────────────────────────────────────────────────────────
❌ 28 templates à gérer              ✅ 28 fichiers HTML
❌ env vars pour chaque ID          ✅ Pas d'env vars
❌ Sync manuel                      ✅ Auto avec git
❌ UI Brevo Builder                ✅ Votre IDE
❌ Variables limitées               ✅ Infinies
❌ Code review = click              ✅ Code review
❌ $$$ storage                      ✅ FREE
✅ Template preview Brevo           ❌ Preview en HTML
```

---

## 📞 Support Migration

**Questions?** Voir:
- [docs/EMAIL_NO_BREVO_BUILDER.md](../EMAIL_NO_BREVO_BUILDER.md)
- [src/server/services/emailTemplateService.ts](../src/server/services/emailTemplateService.ts)
- [src/templates/emails/*.html](../src/templates/emails/)

**Commits à garder:**
```bash
git log --oneline | grep -i "migrate.*template"
```

---

**Prêt à migrer? 🚀**

Vous pouvez migrer **progressivement** - pas besoin de tout faire en une fois!
