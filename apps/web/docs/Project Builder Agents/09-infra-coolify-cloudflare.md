# AGENT 09 — Infrastructure (Coolify + Cloudflare + Docker)
> Mission : Configurer l'infrastructure de déploiement complète de pretalkme.
> **Travail sur Coolify dashboard + Cloudflare dashboard + fichiers Docker du repo**

---

## Contexte

pretalkme est déployé sur **Coolify** (self-hosted sur VPS).
**Cloudflare** gère le DNS, le proxy, le cache et la protection.
Tous les services tournent dans des conteneurs Docker.

**Prérequis avant de commencer :**
- VPS avec minimum 8 vCPU / 16 GB RAM / 100 GB SSD (OVH, Contabo, Hetzner)
- Coolify installé sur le VPS (via `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`)
- Domaine `pretalkme.com` dans Cloudflare
- Compte Supabase créé (cloud.supabase.com)
- Compte Cloudflare R2 créé

---

## ÉTAPE 1 — Configuration Cloudflare DNS

### Records à créer dans Cloudflare DNS

```
-- Sur le domaine pretalk.me existant, ajouter ces sous-domaines :
Type  Name        Value (IP du VPS)   Proxy
A     app         xxx.xxx.xxx.xxx     ✅ Proxied   ← app.pretalk.me
A     api         xxx.xxx.xxx.xxx     ✅ Proxied   ← api.pretalk.me
A     ai          xxx.xxx.xxx.xxx     ✅ Proxied   ← ai.pretalk.me (optionnel, réseau interne)
CNAME media       pretalk-media.xxx.r2.cloudflarestorage.com  ✅ Proxied  ← media.pretalk.me

-- Note : Le @ (pretalk.me) et www.pretalk.me existent déjà — NE PAS les modifier
```

### Page Rules Cloudflare

```
# Règle 1 : Pas de cache sur l'API et les webhooks
Pattern : api.pretalkme.com/*
Setting : Cache Level = Bypass

# Règle 2 : Pas de cache sur la SPA React
Pattern : pretalkme.com/app/*
Setting : Cache Level = Bypass

# Règle 3 : Cache agressif sur la landing Astro (statique)
Pattern : pretalkme.com/*
Setting : Cache Level = Cache Everything, Edge Cache TTL = 4h
```

### SSL/TLS

```
Mode : Full (Strict)
Always Use HTTPS : ON
HSTS : ON (max-age=31536000)
Min TLS Version : 1.2
```

### WAF (Web Application Firewall)

```
# Règle custom : Rate limiting webhooks Meta
Rule : (http.request.uri.path eq "/webhook/meta" and rate > 200/min)
Action : Block

# Règle custom : Bloquer pays hors scope (optionnel)
# Décommenter si besoin
# Rule : (ip.geoip.country ne "MA" and ip.geoip.country ne "FR" and ...)
# Action : Challenge (CAPTCHA)
```

---

## ÉTAPE 2 — Configuration Coolify

### 2.1 Créer les services de base (volumes persistants)

**Redis :**
```yaml
# Dans Coolify → New Service → Docker Compose
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

**RabbitMQ :**
```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management
    environment:
      RABBITMQ_DEFAULT_USER: pretalkme
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
      RABBITMQ_DEFAULT_VHOST: pretalkme
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    restart: unless-stopped
    # Port 15672 (Management UI) — exposer temporairement pour setup, fermer ensuite
    # Port 5672 (AMQP) — réseau interne Coolify uniquement

volumes:
  rabbitmq_data:
```

**Qdrant :**
```yaml
services:
  qdrant:
    image: qdrant/qdrant:latest
    volumes:
      - qdrant_data:/qdrant/storage
    restart: unless-stopped

volumes:
  qdrant_data:
```

### 2.2 Déployer pretalkme-web (apps/web)

Dans Coolify → New Application → Docker :

```
Source : GitHub repo (pretalkme) → Branch: main → Path: apps/web
Build method : Dockerfile (apps/web/Dockerfile)
Port : 3000
Domain : app.pretalk.me
```

**Variables d'environnement (Build Args) :**
```env
# Ces variables sont passées au moment du BUILD (VITE_ = côté client)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

VITE_API_URL=https://api.pretalkme.com
VITE_WS_URL=wss://api.pretalkme.com

# Variables runtime
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
```

**IMPORTANT :** Les variables `VITE_*` doivent être injectées au **build time** (pas seulement runtime) car Astro les bundle dans le JS client. Dans Coolify, les configurer comme Build Arguments ET Environment Variables.

### 2.3 Déployer pretalkme-api (apps/api)

```
Source : GitHub repo (pretalkme) → Branch: main → Path: apps/api
Build method : Dockerfile (apps/api/Dockerfile)
Port : 4000
Domain : api.pretalk.me
```

**Variables d'environnement (Runtime uniquement) :**
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

RABBITMQ_URL=amqp://pretalkme:${RABBITMQ_PASSWORD}@rabbitmq:5672/pretalkme
REDIS_URL=redis://redis:6379

META_APP_SECRET=xxx
META_VERIFY_TOKEN=pretalkme_verify_xxx
META_GRAPH_API_VERSION=v19.0

R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY=xxx
R2_SECRET_KEY=xxx
R2_BUCKET=pretalkme-media
R2_PUBLIC_URL=https://media.pretalk.me

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

CORS_ORIGIN=https://app.pretalk.me
PORT=4000
NODE_ENV=production
```

**Network :** Connecter au même réseau Docker que Redis et RabbitMQ.

### 2.4 Déployer pretalkme-ai (services/ai)

```
Source : GitHub repo (pretalkme) → Branch: main → Path: services/ai
Build method : Dockerfile (services/ai/Dockerfile)
Port : 8000
Domain : (optionnel) ai.pretalkme.com
         Si réseau interne uniquement : pas de domaine public
```

**Variables d'environnement :**
```env
RABBITMQ_URL=amqp://pretalkme:${RABBITMQ_PASSWORD}@rabbitmq:5672/pretalkme
REDIS_URL=redis://redis:6379

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
ELEVENLABS_API_KEY=xxx

R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY=xxx
R2_SECRET_KEY=xxx
R2_BUCKET=pretalkme-media

QDRANT_URL=http://qdrant:6333

PORT=8000
```

---

## ÉTAPE 3 — Cloudflare R2 (Stockage Médias)

### Créer le bucket R2

```
Bucket name : pretalkme-media
Region : auto (closest to Europe)
```

### Configurer le domaine personnalisé

```
Dans R2 → Settings → Custom Domain :
Ajouter : media.pretalkme.com
→ Cloudflare crée automatiquement le CNAME

DNS résultant :
CNAME  media  pretalkme-media.xxx.r2.cloudflarestorage.com  ✅ Proxied
```

### CORS Policy R2

```json
[
  {
    "AllowedOrigins": ["https://pretalkme.com", "https://api.pretalkme.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### Structure des dossiers R2

```
pretalkme-media/
├── wa/                    ← Voice notes WhatsApp inbound (téléchargées depuis Meta)
│   └── {tenant_id}/
│       └── {wamid}.ogg
├── tts/                   ← Voice notes générées par TTS (outbound)
│   └── {tenant_id}/
│       └── {conversation_id}_{timestamp}.ogg
├── sim/                   ← Fichiers audio du simulateur (temporaires)
│   └── {tenant_id}/
└── media/                 ← Images, documents, vidéos WhatsApp
    └── {tenant_id}/
```

**Politique de rétention :** Les fichiers `sim/` expireront après 24h (R2 lifecycle rule).

---

## ÉTAPE 4 — CI/CD avec Coolify (Auto-Deploy)

### Webhook GitHub → Coolify

Dans Coolify → Application → Settings → Webhooks :
```
Copier le webhook URL Coolify
→ GitHub repo → Settings → Webhooks → Add webhook
→ Payload URL : [URL Coolify]
→ Events : Push (branch main)
```

### Stratégie de déploiement

```
Branch main → Deploy automatique (staging ignoré pour V1)
Branch develop → Pas de deploy auto

Build order :
1. packages/shared (dépendance)
2. apps/web (frontend)
3. apps/api (backend)
4. services/ai (service IA)
```

### Health Checks Coolify

```
apps/web   : GET app.pretalk.me/whatsapp/  → 200
apps/api   : GET api.pretalk.me/health     → { "status": "ok" }
services/ai: GET ai.pretalk.me/health      → { "status": "ok" }
```

Créer le endpoint health dans NestJS :
```typescript
@Controller()
export class AppController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'pretalkme-api', timestamp: new Date().toISOString() }
  }
}
```

---

## ÉTAPE 5 — Monitoring & Alertes

### Sentry (erreurs)

```typescript
// apps/web : déjà configuré dans pretalk-hub, adapter les noms
// apps/api : installer @sentry/nestjs

// apps/api/src/main.ts
import * as Sentry from '@sentry/node'
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
```

### Logs (Coolify built-in)

```
Coolify → Application → Logs : logs temps réel pour chaque service
Retention : 7 jours par défaut (augmenter à 30j en settings)
```

### Alertes critiques à configurer

```
1. RabbitMQ queue ai.tasks > 100 messages en attente
   → Alert : service IA saturé ou planté

2. Coolify health check fail × 3
   → Alert : service down

3. Redis memory > 80%
   → Alert : augmenter limite ou investiguer

4. Stripe webhook échec
   → Alert : billing non synchronisé
```

---

## ÉTAPE 6 — Sécurité Serveur

### Firewall VPS (ufw)

```bash
# Sur le VPS
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (redirect HTTPS par Cloudflare)
ufw allow 443/tcp   # HTTPS

# Coolify internal ports — PAS exposés public
# RabbitMQ 5672, Redis 6379, Qdrant 6333 → réseau Docker interne uniquement

ufw enable
```

### Backup automatique

```bash
# Script backup quotidien (cron sur VPS)
# Supabase : backup automatique inclus (cloud)
# Redis : AOF persistance activée dans docker-compose
# RabbitMQ : messages durables, persistent dans volume

# Backup fichiers R2 : Cloudflare gère la redondance
```

---

## Checklist de déploiement initial

```
□ VPS commandé et Coolify installé
□ Cloudflare DNS configuré (A records)
□ SSL Cloudflare actif (Full Strict)
□ Supabase projet créé + schéma exécuté (Agent 08)
□ R2 bucket créé + domaine media.pretalk.me actif
□ Redis déployé sur Coolify
□ RabbitMQ déployé sur Coolify
□ Qdrant déployé sur Coolify
□ pretalkme-web déployé → app.pretalk.me/whatsapp répond 200
□ pretalkme-api déployé → api.pretalk.me/health répond OK
□ pretalkme-ai déployé → health check OK
□ Webhook Meta configuré → GET /webhook/meta vérifié
□ Stripe webhook configuré → /billing/webhook actif
□ Sentry configuré sur web + api
□ CI/CD GitHub → Coolify webhook actif
□ Test E2E : envoyer message WA test → apparaît dans inbox
```

---

## ⚠️ Actions à faire par le propriétaire du projet (toi)

### VPS & Serveur
```
□ Commander un VPS (recommandé : Hetzner CX41 — 4 vCPU, 16GB RAM, 160GB SSD — ~15€/mois)
  → Ou OVH VPS Value, Contabo VPS M
□ Installer Coolify :
  ssh root@<ip-vps>
  curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
□ Accéder à Coolify : http://<ip-vps>:8000 → créer le compte admin
□ Configurer la clé SSH pour les déploiements Git
```

### Cloudflare
```
□ S'assurer que pretalk.me est géré dans Cloudflare (nameservers Cloudflare)
□ Ajouter les DNS records sous-domaines (voir ÉTAPE 1 ci-dessus) :
   app.pretalk.me → IP VPS
   api.pretalk.me → IP VPS
   media.pretalk.me → R2 bucket
□ Activer "Full (Strict)" SSL
□ Activer "Always Use HTTPS"
```

### Cloudflare R2
```
□ Dashboard Cloudflare → R2 → Create Bucket → "pretalk-media"
□ R2 → Manage R2 API Tokens → Create Token
  → Permissions : Object Read & Write
  → Récupérer : Access Key ID, Secret Access Key
□ R2 → Bucket → Settings → Custom Domains → Add : media.pretalk.me
```

### Supabase
```
□ cloud.supabase.com → New Project → "pretalkme" → Région : EU West
□ Settings → API → Récupérer : URL, anon key, service_role key
□ Exécuter les scripts SQL de l'Agent 08 dans SQL Editor
```

### Meta WhatsApp (voir aussi Agent 06)
```
□ developers.facebook.com → My Apps → Create App → Business
□ WhatsApp → Add Product
□ WhatsApp → Configuration → Webhook :
  URL : https://api.pretalk.me/webhook/meta
  Verify Token : (à définir → META_VERIFY_TOKEN dans .env)
□ Tester avec le numéro test fourni par Meta
```

## Résultat attendu

- `app.pretalk.me/whatsapp` répond (SPA React montée)
- `api.pretalk.me/health` → `{ "status": "ok" }`
- Redis, RabbitMQ, Qdrant actifs et accessibles depuis les autres services
- R2 accessible depuis NestJS et FastAPI pour upload/download
- Deploy automatique sur push sur `main`
- Webhook Meta enregistré et vérifié par Meta
