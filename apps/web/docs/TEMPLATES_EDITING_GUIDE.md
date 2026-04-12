# 🎨 TEMPLATES GUIDE - Comment Modifier les Emails

**Aucune connaissance technique requise!**

---

## 📍 Où Trouver les Templates

Tous les templates sont dans:

```
src/templates/emails/
├── delivery_audit.fr.html
├── delivery_audit.en.html
├── delivery_proposition.fr.html
├── kickoff_ready.fr.html
└── (autres templates...)
```

**Ouvrir** dans VS Code pour éditer

---

## ✏️ Structure d'un Template

Tous les templates ont le même format:

```html
<!-- subject: 📊 {{brand_name}} - Votre audit est prêt -->
    ↑
    Cette ligne définit l'OBJET du mail

<!DOCTYPE html>
<html>
<head>
  <style>
    /* CSS pour la présentation */
  </style>
</head>
<body>
  <!-- Le CONTENU du mail -->
  <h1>Bonjour {{nom_client}}</h1>
  <p>Texte avec {{variables}}</p>
</body>
</html>
```

---

## 🔤 Variables (Remplacées Automatiquement)

Dans vos templates, utilisez `{{variable_name}}`

### Variables Branding (Toujours Disponibles)

```
{{brand_name}}              → "Pretalk"
{{brand_logo_url}}          → "https://cdn.pretalk.me/logo.png"
{{brand_primary_color}}     → "#0D3B66"
{{brand_secondary_color}}   → "#1782C5"
{{brand_support_email}}     → "support@pretalk.me"
```

### Variables Spécifiques au Template

Dépend du template:

**delivery_audit:**
- `{{nom_client}}` → Nom du client
- `{{nom_consultant}}` → Nom du consultant
- `{{nom_entreprise}}` → Entreprise
- `{{audit_url}}` → Lien vers l'audit
- `{{audit_summary}}` → Résumé audit

**delivery_proposition:**
- `{{nom_client}}`
- `{{proposal_url}}`
- `{{proposal_count}}` → Nombre de propositions

**kickoff_ready:**
- `{{nom_client}}`
- `{{kickoff_url}}`
- `{{kickoff_date}}`
- `{{kickoff_time}}`

---

## 🎨 Guide d'Édition Facile

### 1. Changer the Subject

```html
<!-- subject: 📊 {{brand_name}} - Votre audit est prêt -->
                 ↑ Éditer ici
<!-- subject: 🎯 {{brand_name}} - Votre analyse stratégique -->
```

### 2. Changer les Couleurs

```html
<style>
  .header { background: {{brand_primary_color}}; }
  .button { background: {{brand_secondary_color}}; }
</style>
```

Utiliser les variables `{{brand_primary_color}}` et `{{brand_secondary_color}}`

Ou utiliser des couleurs customisées:

```html
<style>
  .header { background: #0D3B66; }      ← Couleur primaire
  .highlight { background: #1782C5; }  ← Couleur secondaire
  .success { background: #4caf50; }    ← Custom color
</style>
```

### 3. Changer le Contenu Principal

Éditer directement le texte:

```html
<p>Bonjour <strong>{{nom_client}}</strong>,</p>

↓ Changer en:

<p>Bienvenue <strong>{{nom_client}}</strong>! 👋</p>
```

### 4. Ajouter des Images

```html
<img src="{{brand_logo_url}}" alt="{{brand_name}}" />

↓ Ou utiliser URL directe:

<img src="https://cdn.pretalk.me/header.png" alt="Pretalk" />
```

### 5. Ajouter des Boutons

```html
<a href="{{audit_url}}" class="button">👁️ Consulter votre audit</a>

↓ Changer le texte ou ajouter emoji:

<a href="{{audit_url}}" class="button">🚀 Lancer l'audit</a>
```

### 6. Ajouter du Contenu Conditionnel

Afficher du texte SEULEMENT si condition vraie:

```html
{{#if premium_tier}}
  <p>🎁 Accès premium exclusif!</p>
{{/if}}

{{#if new_lead}}
  <p>Bienvenue parmi les nouveaux clients!</p>
{{/if}}
```

### 7. Afficher des Listes

```html
{{#each action_items}}
  <li>✅ {{this}}</li>
{{/each}}
```

### 8. Formater les Dates

```html
Le {{date_debut | date:'fr'}}      → "26/03/2026"
Le {{date_debut | date:'long'}}    → "March 26, 2026"
```

### 9. Formater les Nombres

```html
Total: {{montant | currency}}      → "1 234,56 €"
Pourcentage: {{taux | number}}%    → "25.5%"
```

### 10. Mettre en Majuscules/Minuscules

```html
{{nom_client | uppercase}}         → "JEAN DUPONT"
{{nom_client | lowercase}}         → "jean dupont"
{{nom_client | capitalize}}        → "Jean dupont"
```

---

## 📋 Exemple Complet: Éditer delivery_audit.fr.html

**Original:**
```html
<!-- subject: 📊 {{brand_name}} - Votre audit est prêt -->

<h1>{{brand_name}}</h1>
<p>Bonjour <strong>{{nom_client}}</strong>,</p>
<p>Nous avons terminé l'analyse de votre situation.</p>
<a href="{{audit_url}}" class="button">📊 Voir l'audit</a>
```

**Modification 1: Changer le subject et intro**
```html
<!-- subject: 🎯 {{brand_name}} - Votre stratégie en 5 points clés -->

<h1>Stratégie Personnalisée pour {{nom_enterprise}}</h1>
<p>Bonjour {{nom_client}},</p>
<p>Découvrez {{audit_summary}} pour accélérer votre croissance!</p>
<a href="{{audit_url}}" class="button">🚀 Consulter les recommandations</a>
```

**Modification 2: Ajouter section bonus**
```html
<a href="{{audit_url}}" class="button">📊 Voir l'audit</a>

↓ Ajouter après:

<p>{{#if has_recommendations}}<strong>Bonus:</strong> Découvrez en priorité nos 3 recommandations d'impact rapide.{{/if}}</p>
```

**Modification 3: Ajouter footer personnalisé**
```html
<p>Cordialement,<br/>
<strong>{{nom_consultant}}</strong><br/>
Consultant Strategic chez {{brand_name}}</p>
```

---

## 🖥️ Preview des Modifications

Après édition, tester:

```bash
# Démarrer le backend
npm run dev:server

# Dans tout le browser:
curl -X POST http://localhost:8787/api/email/send-template \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "delivery_audit",
    "recipient_email": "vous@example.com",
    "locale": "fr",
    "template_params": {
      "nom_client": "Marie Dupont",
      "nom_consultant": "Alice Martin",
      "nom_entreprise": "Tech Solutions",
      "audit_url": "https://app.pretalk.me/audit/123",
      "audit_summary": "5 opportunités identifiées"
    }
  }'

# Vérifier l'email reçu dans votre inbox!
```

---

## 🎨 Colors Reference

### Colors Pretalk (à utiliser dans les styles)

```css
/* Primary Colors */
--brand-primary: #0D3B66;       /* Bleu profond */
--brand-secondary: #1782C5;     /* Bleu clair */

/* Semantic Colors */
--success: #4caf50;             /* Vert */
--warning: #ff9800;             /* Orange */
--danger: #f44336;              /* Rouge */
--info: #2196f3;                /* Bleu info */

/* Neutral */
--white: #ffffff;
--light-gray: #f0f0f0;
--medium-gray: #999;
--dark-gray: #333;
```

---

## 📐 Responsive Design

Les templates s'affichent correctement sur:
- 📱 Téléphones
- 📱 Tablettes
- 💻 Ordinateurs

Grâce à:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
  .container { max-width: 600px; margin: 0 auto; }
  /* Mobile-first CSS */
</style>
```

---

## ✅ Checklist Avant Publication

Avant d'envoyer un email modifié:

- [ ] Subject est clair et attractif
- [ ] Variables `{{...}}` correctes (vérifie le spelling)
- [ ] Lien `href="{{url_variable}}"` correct
- [ ] Images s'affichent (`img src`)
- [ ] Couleurs Brevo utilisées (ou custom harmonieuses)
- [ ] Texte lisible sur mobile (max 600px)
- [ ] Pas de fautes de frappe
- [ ] Signataire clair (qui envoie ce mail?)
- [ ] Call To Action (bouton) visible
- [ ] Test reçu dans inbox et s'affiche bien

---

## 🚫 Erreurs Courantes

### ❌ Oublie d'une variable

```html
<!-- WRONG -->
<p>Bonjour client</p>

<!-- CORRECT -->
<p>Bonjour {{nom_client}}</p>
```

### ❌ Mauvaise variable

```html
<!-- WRONG: nom_client (n'existe pas dans delivery_proposition) -->
<p>Bonjour {{nom_client}}</p>

<!-- CORRECT pour delivery_proposition -->
<p>Bonjour {{recipient_name}}</p>
```

### ❌ URLs cassées

```html
<!-- WRONG: variable pas remplacée -->
<a href="{{audit_url}}">Voir l'audit</a>

<!-- Avez-vous passé audit_url dans template_params? -->
```

### ❌ Styles CSS cassés

```html
<!-- WRONG: Sélecteur invalide -->
<style>
  .button {
    background {{brand_primary_color}};  ← Manque deux-points
  }
</style>

<!-- CORRECT -->
<style>
  .button {
    background: {{brand_primary_color}};
  }
</style>
```

---

## 📞 Support

**Besoin d'aide?**
- Lire: [docs/EMAIL_NO_BREVO_BUILDER.md](../EMAIL_NO_BREVO_BUILDER.md)
- Code: [src/templates/emails/](../src/templates/emails/)
- Services: [src/server/services/emailTemplateService.ts](../src/server/services/emailTemplateService.ts)

---

**✨ Vous êtes prêt à créer de magnifiques emails! 🚀**
