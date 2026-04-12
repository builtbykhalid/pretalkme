# 🚀 GUIDE DE DÉPLOIEMENT - Email Backend API v1

**Date:** 26 Mars 2026  
**Version:** 1.0 (Brevo + Backend Email API)  
**Audience:** DevOps, SRE, Backend Engineers  
**Durée d'exécution:** ~30 minutes (+ tests manuels)

---

## 📋 Checklist Pré-Déploiement

- [ ] Backend email API code reviewed and tested
- [ ] Brevo API key obtained and validated
- [ ] Database migrations applied (6 new migrations)
- [ ] Supabase RLS policies configured
- [ ] Email templates created in Brevo dashboard
- [ ] Environment variables set in deployment target
- [ ] SSL certificates renewed (if applicable)
- [ ] Monitoring/alerting configured
- [ ] Backup database before migrations
- [ ] Test auth token generated for integration tests

---

## 1️⃣ ENVIRONMENT VARIABLES

### Production Environment (`.env.production`)

```bash
# ▶️ BREVO CONFIGURATION
BREVO_API_KEY=xkeysib-xxxxxxxxxxxx  # Get from https://app.brevo.com/account/keys
BREVO_SENDER_EMAIL=noreply@pretalk.me
BREVO_BRAND_LOGO_URL=https://cdn.pretalk.me/logo.png
BREVO_BRAND_PRIMARY_COLOR=#0D3B66
BREVO_BRAND_SECONDARY_COLOR=#1782C5

# ▶️ BACKEND EMAIL API
BACKEND_URL=https://api.pretalk.me
EMAIL_API_PORT=8787
EMAIL_API_LOG_LEVEL=info

# ▶️ SUPABASE
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ▶️ BREVO TEMPLATES (Event Type → Template ID Mapping)
# These IDs are created manually in Brevo dashboard
BREVO_TEMPLATE_DELIVERY_AUDIT_FR=20
BREVO_TEMPLATE_DELIVERY_AUDIT_EN=21
BREVO_TEMPLATE_DELIVERY_AUDIT_ES=22
BREVO_TEMPLATE_DELIVERY_AUDIT_AR=23

BREVO_TEMPLATE_DELIVERY_PROPOSITION_FR=30
BREVO_TEMPLATE_DELIVERY_PROPOSITION_EN=31
BREVO_TEMPLATE_DELIVERY_PROPOSITION_ES=32
BREVO_TEMPLATE_DELIVERY_PROPOSITION_AR=33

BREVO_TEMPLATE_KICKOFF_READY_FR=60
BREVO_TEMPLATE_KICKOFF_READY_EN=61
BREVO_TEMPLATE_KICKOFF_READY_ES=62
BREVO_TEMPLATE_KICKOFF_READY_AR=63

BREVO_TEMPLATE_NEW_LEAD_FR=10
BREVO_TEMPLATE_NEW_LEAD_EN=11

# ▶️ MONITORING & ERROR TRACKING
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/123456
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=v1.0.0-email-migration
```

### Development Environment (`.env.local`)

```bash
BREVO_API_KEY=test-api-key-xxxxxxx
BREVO_SENDER_EMAIL=noreply@pretalk.me

SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

BACKEND_URL=http://localhost:8787
EMAIL_API_PORT=8787
EMAIL_API_LOG_LEVEL=debug

# Use low template IDs for dev (or reuse prod IDs for testing)
BREVO_TEMPLATE_DELIVERY_AUDIT_FR=1
```

---

## 2️⃣ DATABASE SETUP

### Step 1: Backup Current Database

```bash
# Backup Supabase database before migrations
supabase db pull --staging  # or prod equivalent

# Store backup path
BACKUP_FILE="db_backup_2026-03-26_$(date +%H%M%S).sql"
pg_dump postgresql://user:pass@host/db > /backups/$BACKUP_FILE
echo "✅ Backup saved: /backups/$BACKUP_FILE"
```

### Step 2: Apply Migrations

```bash
# Login to Supabase CLI
supabase login

# Apply all new migrations
supabase migration up

# Or manually via Supabase dashboard:
# 1. Go to SQL Editor
# 2. Upload files from supabase/migrations/:
#    - 202603260002_add_email_send_logs_table.sql
#    - 202603260003_pdf_templates_and_generation.sql
#    - 202603260004_phase_2_3_database_fixes.sql
#    - 202603260005_complete_integration_tables.sql
#    - 202603260006_pdf_templates_family_alignment.sql
```

### Step 3: Verify Migrations

```bash
# Check tables are created
psql -h host -U user -d db -c "\dt email_send_logs pdf_templates document_sending_logs"

# Verify functions
psql -h host -U user -d db -c "\df validate_email_before_send sync_lead_status"

# Check RLS policies
psql -h host -U user -d db -c "\dp email_send_logs"
```

---

## 3️⃣ BREVO CONFIGURATION

### Create Email Templates in Brevo Dashboard

**Navigate:** https://app.brevo.com/email/template

#### Template: Delivery Audit (ID: 20 FR / 21 EN)

```html
<!-- Email template with placeholders -->
<h1>{{params.brand_name}} - Votre audit est prêt</h1>
<p>Bonjour {{params.nom_client}},</p>
<p>Nous avons terminé l'analyse de votre situation.</p>
<a href="{{params.audit_url}}">📊 Consulter votre audit</a>
<p>Cordialement,<br/>{{params.nom_consultant}}</p>
```

**Subject:** `📊 {{params.brand_name}} - Votre audit est prêt`

#### Template: Delivery Proposition (ID: 30 FR / 31 EN)

```html
<h1>{{params.brand_name}} - Propositions d'accompagnement</h1>
<p>Bonjour {{params.nom_client}},</p>
<p>Découvrez nos propositions d'accompagnement adaptées à vos besoins.</p>
<a href="{{params.proposal_url}}">📋 Voir les propositions</a>
<p>{{params.nom_consultant}}</p>
```

**Subject:** `📋 {{params.brand_name}} - Propositions pour votre entreprise`

#### Template: Kickoff Ready (ID: 60 FR / 61 EN)

```html
<h1>{{params.brand_name}} - Lançons ensemble</h1>
<p>Bonjour {{params.nom_client}},</p>
<p>Merci de votre confiance! Le moment est venu de lancer nos travaux.</p>
<a href="{{params.kickoff_url}}">🚀 Accéder au formulaire de démarrage</a>
<p>À bientôt!</p>
```

**Subject:** `🚀 {{params.brand_name}} - Démarrage du projet`

**Verify:** Copy template ID from Brevo dashboard URL:
`https://app.brevo.com/email/template/{ID}/edit`

---

## 4️⃣ BACKEND DEPLOYMENT

### Local Testing First

```bash
cd pretalk-hub

# Install dependencies
npm install

# Build backend
npm run build:server

# Start backend locally
npm run dev:server
# Should see: "[server] listening on http://localhost:8787"

# In another terminal, test health check
curl -X GET http://localhost:8787/api/email/health
# Expected: {"status":"ok","brevo":"configured","timestamp":"..."}
```

### Production Deployment

#### Option A: Docker (Recommended)

```bash
# Build image
docker build -t pretalk-backend:v1 -f Dockerfile.server .

# Tag for registry
docker tag pretalk-backend:v1 {registry}/pretalk-backend:v1

# Push
docker push {registry}/pretalk-backend:v1

# Deploy
kubectl set image deployment/pretalk-backend \
  pretalk-backend={registry}/pretalk-backend:v1 \
  --record

# Verify rollout
kubectl rollout status deployment/pretalk-backend
```

#### Option B: Node.js + PM2

```bash
# SSH into production server
ssh deploy@prod-server.com

# Deploy code
cd /app/pretalk-hub
git pull origin main
npm install --production

# Start with PM2
pm2 start src/server/index.ts \
  --name pretalk-backend \
  --env production \
  --instances max

# Save PM2 config
pm2 save
pm2 startup

# Verify
pm2 status
```

#### Option C: Serverless (Vercel/AWS Lambda)

```bash
# Deploy to Vercel
vercel deploy --prod

# Deploy to AWS Lambda
npm run build:server
zip -r function.zip ./dist ./node_modules
aws lambda update-function-code \
  --function-name pretalk-email-api \
  --zip-file fileb://function.zip
```

---

## 5️⃣ FRONTEND INTEGRATION TEST

### Verify Backend Email Client Works

```bash
cd src/components/ReactApp

# Check emailApi.ts exists
test -f lib/emailApi.ts && echo "✅ Email API client found"

# Verify imports in LeadReview.tsx
grep -n "sendAppTemplateEmail" pages/LeadReview.tsx | head -5
# Should show 3+ lines where sendAppTemplateEmail is called
```

### Manual UI Test

1. Navigate to app: `https://app.pretalk.me`
2. Open Lead Review page for a test lead
3. Click "Send Audit" button
4. Check:
   - [ ] No console errors
   - [ ] Toast notification appears (success/error)
   - [ ] Email received in test inbox within 30 seconds
   - [ ] Database logs created: `email_send_logs` table

---

## 6️⃣ MONITORING & ALERTS

### Sentry Configuration

```typescript
// src/server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 1.0,
  includeLocalVariables: true,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### CloudWatch Logs (AWS)

```bash
# Monitor email API errors in real-time
aws logs tail /aws/lambda/pretalk-email-api --follow

# Get error count last hour
aws logs get-metric-statistics \
  --namespace "pretalk-email" \
  --metric-name "send_errors" \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### Database Monitoring

```sql
-- Check email send success rate
SELECT
  event_type,
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY event_type), 2) as percentage
FROM public.email_send_logs
WHERE sent_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type, status
ORDER BY event_type, percentage DESC;

-- Alert if error rate > 5%
SELECT
  event_type,
  COUNT(*) FILTER (WHERE status != 'sent') as errors,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status != 'sent') / COUNT(*), 2) as error_rate
FROM public.email_send_logs
WHERE sent_at > NOW() - INTERVAL '1 hour'
GROUP BY event_type
HAVING COUNT(*) FILTER (WHERE status != 'sent') > (COUNT(*) * 0.05);
```

---

## 7️⃣ E2E VALIDATION TESTS

### Run Automated Tests

```bash
# Run Jest test suite
npm test -- src/tests/email-e2e.test.ts

# With coverage
npm test -- src/tests/email-e2e.test.ts --coverage

# Verbose output
npm test -- src/tests/email-e2e.test.ts --verbose
```

### Manual Validation Checklist

Use the manual test checklist from `src/tests/email-e2e.test.ts`:

- [ ] Brevo dashboard shows all sent emails
- [ ] Test emails arrive in inbox within 60 seconds
- [ ] Email content matches templates (French/English)
- [ ] Links in emails are clickable and functional
- [ ] Database logs show correct event types
- [ ] No sensitive data exposed in logs
- [ ] Lead status updates after email send
- [ ] Failed sends logged with error message
- [ ] Batch send respects rate limits

---

## 8️⃣ MIGRATION FROM N8N

### Phase 1: Stop N8N Email Webhooks (Day 1)

```bash
# In n8n dashboard:
# 1. Go to Workflows
# 2. Find: "Pretalk - Master Email Hub"
# 3. Click: Deactivate (don't delete, keep for reference)
# 4. Find: "Pretalk - Lead Actions Hub"
# 5. Migrate SendGrid nodes to Brevo (or disable)

# Verify no calls to n8n from frontend:
grep -r "N8N_SEND_OFFER_WEBHOOK\|N8N_LEAD_ACTIONS_WEBHOOK\|N8N_MASTER_EMAIL_HUB" src/ | grep -v "DEPRECATED"
# Should return: 0 matches (or only in node_modules/)
```

### Phase 2: Monitor Metrics (Days 1-7)

Track these metrics to ensure smooth transition:

```sql
-- Email send rate by source
SELECT
  DATE_TRUNC('hour', sent_at) as hour,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'sent') as successful,
  COUNT(*) FILTER (WHERE status != 'sent') as failed
FROM public.email_send_logs
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', sent_at)
ORDER BY hour DESC;

-- Response time percentiles
SELECT
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_ms) as p50_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_ms
FROM public.email_send_logs
WHERE sent_at > NOW() - INTERVAL '7 days' AND status = 'sent';
```

### Phase 3: Decommission N8N Workflows (Week 2)

Once metrics look stable:

```bash
# Export n8n workflows for archive
n8n-cli export:workflow --all > n8n_workflows_archive_v1.json

# Delete empty/deprecated workflows from n8n
# Keep: generate-audit, generate-proposal, generate-devis, onboarding-augmented
# Delete: master-email-hub (send logic), lead-actions-hub (email part)

# Update documentation
# See: docs/PRETALK_COMPLETE_EMAILING.md
```

---

## 9️⃣ TROUBLESHOOTING

### Issue: Emails not sending

```bash
# 1. Check Brevo API key
curl -X GET https://api.brevo.com/v3/account \
  -H "api-key: $BREVO_API_KEY"
# Expected: 200 with account info

# 2. Check logs
tail -f /var/log/pretalk-backend.log | grep -i email

# 3. Query database
SELECT * FROM email_send_logs 
WHERE status != 'sent' 
ORDER BY sent_at DESC LIMIT 10;

# 4. Check Supabase token validity
curl -X GET https://supabase.co/api/auth/v1/user \
  -H "Authorization: Bearer $SUPABASE_TOKEN"
```

### Issue: High error rate

```bash
# Get recent errors
SELECT error, COUNT(*) as count
FROM email_send_logs
WHERE status != 'sent'
  AND sent_at > NOW() - INTERVAL '1 hour'
GROUP BY error
ORDER BY count DESC;

# Common errors:
# - "Invalid template ID" → verify BREVO_TEMPLATE_* env vars
# - "Invalid recipient email" → validate email format in payload
# - "API rate limit exceeded" → reduce batch size, add exponential backoff
# - "Authentication failed" → verify BREVO_API_KEY and SUPABASE tokens
```

### Issue: Template Variables Not Rendering

```bash
# Check template params are passed
SELECT template_params FROM email_send_logs 
WHERE event_type = 'delivery_audit' LIMIT 1;

# Verify Brevo template uses correct {{params.xxx}} syntax
# (not {{xxx}} or ${xxx})

# Test Brevo API directly
curl -X POST https://api.brevo.com/v3/smtp/email \
  -H "api-key: $BREVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": 20,
    "to": [{"email": "test@example.com"}],
    "params": {"nom_client": "Test User"}
  }'
```

### Issue: Database Connection Issues

```bash
# Check Supabase connection
psql $SUPABASE_CONNECTION_STRING -c "SELECT version();"

# Verify RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'email_send_logs';

# Check permissions
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'email_send_logs';
```

---

## 🔟 POST-DEPLOYMENT VALIDATION

### Day 1: Sanity Checks

- [ ] Health check endpoint responds 200
- [ ] Can send test emails from API
- [ ] Emails arrive in test inbox
- [ ] Database logs record sends
- [ ] No critical errors in logs
- [ ] CPU/Memory usage normal (<50%)

### Day 3: Integration Checks

- [ ] UI send buttons work (audit/proposition/kickoff)
- [ ] Email content displays correctly
- [ ] Database queries complete <100ms
- [ ] Brevo bounce rate <2%
- [ ] No Sentry alerts firing

### Week 1: Production Checks

- [ ] Sustained volume: 100+ emails/hour
- [ ] Error rate stable <1%
- [ ] p95 response time <1s
- [ ] All event types working
- [ ] User feedback positive
- [ ] Ready to archive n8n workflows

---

## 📞 SUPPORT & ESCALATION

For issues contact:

**Email Channel:** `backend@pretalk.me`
**Slack Channel:** `#backend-email-support`
**On-Call:** See PagerDuty rotation

### Incident Response

1. Check Sentry dashboard: https://sentry.io/({your-org})/pretalk
2. Query: `SELECT * FROM email_send_logs WHERE status != 'sent' ORDER BY sent_at DESC`
3. If Brevo down: activate manual email queue (see `/api/email/health`)
4. If Database down: fail gracefully with 503 response
5. Page on-call engineer if error rate >10% or service down >5min

---

**Version History:**
- v1.0 (2026-03-26): Initial deployment guide for backend email API

**Next Steps:**
- [ ] Complete all pre-deployment checks
- [ ] Execute deployment in staging environment
- [ ] Run E2E test suite
- [ ] Get sign-off from tech lead
- [ ] Schedule production deployment
- [ ] Monitor metrics post-deployment
