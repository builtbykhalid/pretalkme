# 🚀 SETUP RAPIDE - Brevo + Gotenberg

**Durée totale:** ~20 minutes  
**Prérequis:** Compte Brevo, Docker (Gotenberg)

---

## 1️⃣ SETUP BREVO (5 min)

### A. Obtenir l'API Key

1. Aller à: https://app.brevo.com/account/keys
2. Copier votre **API Key** sous "SMTP & API"
3. Coller dans `.env.local`:
```bash
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### B. Créer Templates dans Brevo Dashboard

Aller à: https://app.brevo.com/email/template

**Template 1: Delivery Audit (FR)**
- Nom: `Delivery Audit - FR`
- Subject: `📊 {{params.brand_name}} - Votre audit est prêt`
- Body:
```html
<h1>{{params.brand_name}}</h1>
<p>Bonjour {{params.nom_client}},</p>
<p>Votre audit est prêt à consulter.</p>
<a href="{{params.audit_url}}" style="background:#0D3B66;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
  📊 Voir l'audit
</a>
<p>Merci,<br/>{{params.nom_consultant}}</p>
```
- **Copier Template ID** → ajouter à `.env.local` comme `BREVO_TEMPLATE_DELIVERY_AUDIT_FR=XX`

**Répéter pour:**
- ✅ Delivery Audit (EN, ES, AR)
- ✅ Delivery Proposition (FR, EN, ES, AR)
- ✅ Kickoff Ready (FR, EN, ES, AR)
- ✅ (Autres event types selon DEPLOYMENT_GUIDE_EMAIL_V1.md)

### C. Récupérer Template IDs

Pour chaque template créé:
1. Editeur → URL contient: `template/{ID}/edit`
2. Copier le `{ID}` dans `.env.local`

Exemple:
```
https://app.brevo.com/email/template/20/edit  ← template ID = 20
```

### D. Tester Connexion

```bash
# Vérifier que BREVO_API_KEY est valide
curl -X GET https://api.brevo.com/v3/account \
  -H "api-key: $BREVO_API_KEY"

# Réponse attendue: {"email":"...","first_name":"..."}
```

---

## 2️⃣ SETUP GOTENBERG (10 min)

### Option A: Docker Local (Recommandé pour Dev)

```bash
# Démarrer Gotenberg en Docker
docker run -d \
  --name gotenberg \
  -p 3000:3000 \
  gotenberg/gotenberg:latest

# Vérifier que ça tourne
curl http://localhost:3000/health
# Réponse: {"status":"up"}

# Ajouter à .env.local
GOTENBERG_API_URL=http://localhost:3000
```

### Option B: Cloud Gotenberg (Production)

1. **Lambda Gotenberg:** `https://gotenberg.example.com`
2. **Docker Hub:** `https://your-gotenberg-service.com`
3. **Self-hosted:** `https://gotenberg.prod.pretalk.me`

```bash
# Ajouter à .env.local
GOTENBERG_API_URL=https://your-gotenberg-service.com
GOTENBERG_API_KEY=optional-auth-key
```

### C. Tester Connexion

```bash
# Test: générer PDF simple
curl -X POST http://localhost:3000/forms/libreoffice/convert \
  -F "files=@test.docx" \
  -o output.pdf

# Ou tester HTML → PDF
curl -X POST http://localhost:3000/forms/chromium/convert/html \
  -F "files=@test.html" \
  -o output.pdf
```

---

## 3️⃣ VÉRIFIER SETUP COMPLET

```bash
# Terminal 1: Démarrer backend
cd pretalk-hub
npm install
npm run dev:server

# Terminal 2: Tester endpoints
curl -X GET http://localhost:8787/api/email/health
# Reponse: {"status":"ok","brevo":"configured"}

# Terminal 3: Tester send email
curl -X POST http://localhost:8787/api/email/send-template \
  -H "Authorization: Bearer $YOUR_SUPABASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "delivery_audit",
    "recipient_email": "test@example.com",
    "recipient_name": "Test User",
    "template_params": {
      "audit_url": "https://example.com/audit",
      "nom_consultant": "Marie"
    }
  }'

# Réponse attendue:
# {"success":true,"email_id":"12345","log_id":"log-789"}
```

---

## 4️⃣ BLOCKERS & FIXES

### ❌ Erreur: "Invalid API Key"
```bash
# Vérifier format
echo $BREVO_API_KEY
# Doit commencer par: xkeysib-

# Si vide:
export BREVO_API_KEY="xkeysib-xxxxx"
```

### ❌ Erreur: "Template not found"
```bash
# Vérifier que template ID existe
BREVO_TEMPLATE_DELIVERY_AUDIT_FR=1  # ← existe?

# Aller dans Brevo dashboard:
# https://app.brevo.com/email/template/1/edit

# Si 404 → créer la template d'abord
```

### ❌ Erreur: "Gotenberg connection refused"
```bash
# Vérifier que Docker tourne
docker ps | grep gotenberg

# Sinon redémarrer:
docker stop gotenberg
docker start gotenberg

# Ou relancer:
docker run -d -p 3000:3000 --name gotenberg gotenberg/gotenberg:latest
```

---

## ✅ CHECKLIST FINAL

- [ ] `BREVO_API_KEY` défini et valide
- [ ] Au moins 1 template Brevo créé
- [ ] Template ID copié dans `.env.local`
- [ ] `GOTENBERG_API_URL` accessible (curl /health = 200)
- [ ] Backend démarre sans errors: `npm run dev:server`
- [ ] Health check répond: `curl localhost:8787/api/email/health`
- [ ] Test send email = success
- [ ] Email arrive dans inbox

**Vous êtes prêt! 🎉**

---

## 📞 RÉFÉRENCES

- Brevo Docs: https://developers.brevo.com/docs
- Gotenberg Docs: https://gotenberg.dev/docs/getting-started/general
- Email Template Vars: Voir docs/PRETALK_COMPLETE_EMAILING.md
