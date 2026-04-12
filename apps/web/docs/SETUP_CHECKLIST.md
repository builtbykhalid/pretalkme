# ✅ SETUP CHECKLIST - Brevo + Gotenberg + Backend Email API

**Target Completion:** 27 Mar 2026, 5:00 PM  
**Status:** IN PROGRESS  
**Last Updated:** 26 Mar 2026

---

## 📋 PHASE 1: ENVIRONMENT SETUP (30 min)

- [ ] `.env.local` updated with all Brevo + Gotenberg variables
  - Verify: `grep BREVO .env.local | wc -l` → should show 15+ lines
  - Verify: `grep GOTENBERG .env.local` → should show 2 lines
  
- [ ] Brevo API Key verified
  - Test: `curl -X GET https://api.brevo.com/v3/account -H "api-key: $BREVO_API_KEY"`
  - Response should show: `{"email":"...","first_name":"..."}`
  
- [ ] Supabase Service Role Key added
  - Check: `grep SUPABASE_SERVICE_ROLE_KEY .env.local`
  - **Important:** Use SERVICE_ROLE key, not anon key
  
- [ ] Gotenberg service accessible
  - Docker: `docker ps | grep gotenberg` → should show running container
  - Test: `curl http://localhost:3000/health`
  - Response: `{"status":"up"}`

---

## 📚 PHASE 2: BREVO TEMPLATES (45 min)

| Event Type | FR | EN | ES | AR | Status |
|-----------|----|----|----|----|--------|
| delivery_audit | ⬜ | ⬜ | ⬜ | ⬜ | TODO |
| delivery_proposition | ⬜ | ⬜ | ⬜ | ⬜ | TODO |
| kickoff_ready | ⬜ | ⬜ | ⬜ | ⬜ | TODO |
| new_lead | ⬜ | ⬜ | ⬜ | ⬜ | TODO |
| proposal_follow_up | ⬜ | ⬜ | ⬜ | ⬜ | TODO |
| contract_signed | ⬜ | ⬜ | ⬜ | ⬜ | TODO |
| onboarding_welcome | ⬜ | ⬜ | ⬜ | ⬜ | TODO |
| lead_qualified | ⬜ | ⬜ | ⬜ | ⬜ | TODO |

**Instructions:**
1. Go to: https://app.brevo.com/email/template
2. For each template:
   - [ ] Click "Create template"
   - [ ] Set subject (use template from `config/brevo_templates.json`)
   - [ ] Add HTML body with {{params.xxx}} placeholders
   - [ ] Save
   - [ ] Note Template ID from URL
   - [ ] Update `.env.local` with ID

**Example:** 
```
URL: https://app.brevo.com/email/template/20/edit
Template ID: 20
.env.local: BREVO_TEMPLATE_DELIVERY_AUDIT_FR=20
```

---

## 🔧 PHASE 3: BACKEND DATABASE (20 min)

- [ ] Supabase migrations applied
  ```bash
  supabase migration up
  # Or manually in SQL Editor:
  # - 202603260002_add_email_send_logs_table.sql
  # - 202603260003_pdf_templates_and_generation.sql
  # - 202603260004_phase_2_3_database_fixes.sql
  # - 202603260005_complete_integration_tables.sql
  # - 202603260006_pdf_templates_family_alignment.sql
  ```

- [ ] Verify tables created
  ```bash
  psql -h host -U user -d db -c "\dt email_send_logs pdf_templates email_validation_log"
  # Should show: (3 rows)
  ```

- [ ] Verify functions created
  ```bash
  psql -h host -U user -d db -c "\df validate_email_before_send sync_lead_status"
  # Should show: (2 rows or more)
  ```

---

## 🚀 PHASE 4: BACKEND STARTUP (10 min)

- [ ] Install dependencies
  ```bash
  npm install
  ```

- [ ] Start backend
  ```bash
  npm run dev:server
  # Should see: "[server] listening on http://localhost:8787"
  ```

- [ ] Test health endpoint
  ```bash
  curl -X GET http://localhost:8787/api/email/health
  # Expected: {"status":"ok","brevo":"configured"}
  ```

---

## 🧪 PHASE 5: TEST EMAIL SENDING (15 min)

- [ ] Run E2E test suite
  ```bash
  npm test -- src/tests/email-e2e.test.ts
  # Should show: "PASS src/tests/email-e2e.test.ts"
  ```

- [ ] Manual test: Send test email
  ```bash
  curl -X POST http://localhost:8787/api/email/send-template \
    -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
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
  # Expected: {"success":true,"email_id":"12345","log_id":"log-789"}
  ```

- [ ] Verify email in inbox
  - Check test email account
  - Should arrive within 60 seconds
  - Should have Pretalk branding

- [ ] Verify database logging
  ```sql
  SELECT * FROM email_send_logs 
  WHERE event_type='delivery_audit' 
  ORDER BY sent_at DESC LIMIT 1;
  # Should show 1 row with your test email
  ```

---

## 🚨 PHASE 6: CRITICAL BLOCKER - Lead Actions Hub (60 min)

**Status:** BLOCKING PRODUCTION  
**Priority:** P0  

- [ ] Run blocker fix script
  ```bash
  bash scripts/fix_lead_actions_sendgrid.sh
  ```

- [ ] Choose migration option
  - [ ] Option A: Migrate to Backend API (RECOMMENDED)
    * Update n8n Lead Actions Hub workflow
    * Replace SendGrid nodes with HTTP → /api/email/send-template
    * Test qualified lead action
    * Verify email sent + logged
  
  - [ ] Option B: Replace with Brevo Direct Call (NOT RECOMMENDED)
    * Replace SendGrid with Brevo HTTP node
    * Accept logging gap
    * Schedule backend migration for Phase 2
  
  - [ ] Option C: Temporary Exception (ACCEPTABLE)
    * Document in DEPLOYMENT_GUIDE
    * Schedule fix for Phase 2
    * Set monitoring alert

- [ ] Verify migration
  ```bash
  # Check no SendGrid references remain
  grep -r "SendGrid\|sendgrid" n8n/new/Pretalk_-_Lead_Actions_Hub.json
  # Should return: nothing (or only comments)
  ```

---

## 🎯 PHASE 7: INTEGRATION TEST (verify frontend works) (20 min)

- [ ] Navigate to app UI
  - Open: http://localhost:3000 (or staging URL)
  - Go to Lead Review page
  - Select a test lead

- [ ] Test send audit
  - [ ] Click "Send Audit" button
  - [ ] Check: no console errors
  - [ ] Check: toast notification (success/error)
  - [ ] Check: email received in test inbox
  - [ ] Check: database entry in email_send_logs

- [ ] Test send proposition
  - [ ] Click "Send Proposition" button
  - [ ] Repeat checks above

- [ ] Test kickoff ready
  - [ ] Click "Send Kickoff" button
  - [ ] Repeat checks above

---

## 📊 PHASE 8: MONITORING & ALERTS (10 min)

- [ ] Configure Sentry (optional)
  ```bash
  # Add SENTRY_DSN to .env.local
  SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/123456
  ```

- [ ] Setup database monitoring query
  ```sql
  -- Save for post-deployment monitoring
  SELECT
    DATE_TRUNC('hour', sent_at) as hour,
    event_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status='sent') as successful
  FROM email_send_logs
  WHERE sent_at > NOW() - INTERVAL '24 hours'
  GROUP BY DATE_TRUNC('hour', sent_at), event_type
  ORDER BY hour DESC;
  ```

- [ ] Setup alerting
  - Alert if error_rate > 5%
  - Alert if Brevo API down
  - Alert if response_time > 5s

---

## ✨ FINAL VERIFICATION (5 min)

Before marking as DONE:

- [ ] All env vars set in `.env.local`
- [ ] All Brevo templates created + IDs in `.env`
- [ ] Database migrations applied
- [ ] Backend starts and health check passes
- [ ] E2E tests pass: `npm test -- src/tests/email-e2e.test.ts`
- [ ] Lead Actions Hub blocker fixed (Option A/B/C decided)
- [ ] Manual UI test: send audit/proposition/kickoff → emails received
- [ ] Database shows email_send_logs entries
- [ ] No console errors

---

## 🎉 READY FOR PRODUCTION?

**Prerequisites to go-live:**

- [ ] All checklist items above: DONE ✅
- [ ] Lead Actions Hub migration: VERIFIED ✅
- [ ] Email test cycle: 3 of each type sent + received ✅
- [ ] Database audit trail: All 3 sends logged ✅
- [ ] Team sign-off: Confirmed ✅
- [ ] Backup database taken: CONFIRMED ✅

---

## 📞 BLOCKERS & HELP

| Issue | Solution | Contact |
|-------|----------|---------|
| BREVO_API_KEY rejected | Get new key from https://app.brevo.com/account/keys | backend@pretalk.me |
| Template IDs not found | Create templates in Brevo dashboard first | Marie setup@pretalk.me |
| Gotenberg connection refused | Start Docker: `docker run -d -p 3000:3000 gotenberg/gotenberg` | DevOps team |
| Lead Actions blocker | Run `bash scripts/fix_lead_actions_sendgrid.sh` | backend@pretalk.me |
| Database migration failed | Verify Supabase SERVICE_ROLE_KEY, check SQL syntax | DBA team |

---

## 📝 SIGN-OFF

**Completed by:** ___________________  
**Date:** ___________________  
**Verified by (Tech Lead):** ___________________  
**Date:** ___________________  
**Ready for Production:** ✅ / ❌

---

**Next:** [docs/DEPLOYMENT_GUIDE_EMAIL_V1.md](../DEPLOYMENT_GUIDE_EMAIL_V1.md)
