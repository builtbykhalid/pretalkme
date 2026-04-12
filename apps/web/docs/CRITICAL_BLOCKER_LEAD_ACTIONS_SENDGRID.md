# 🚨 CRITICAL BLOCKER - Lead Actions Hub SendGrid Migration

**Status:** BLOCKING RELEASE  
**Priority:** P0 (must fix before go-live)  
**Date Identified:** 26 Mars 2026  
**Impact:** Cannot achieve "backend-only email" policy with Lead Actions Hub still using SendGrid

---

## Problem Statement

The `n8n/new/Pretalk_-_Lead_Actions_Hub.json` workflow still dispatches email through **SendGrid** (legacy provider), not Brevo or the new backend API.

### Current (Broken) Flow

```
Lead Action Triggered (qualified/rejected/reviewed)
    ↓
n8n Lead Actions Hub Webhook
    ↓
Node: "Send Qualified Email" / "Log Rejection"
    ↓
SendGrid API (❌ WRONG - legacy, out-of-policy)
    ↓
Email sent
```

### Desired (Fixed) Flow

```
Lead Action Triggered (qualified/rejected/reviewed)
    ↓
n8n Lead Actions Hub Webhook (or direct API call)
    ↓
POST /api/email/send-template (backend email API)
    ↓
Brevo API (✅ CORRECT - unified, branded, logged)
    ↓
Email sent + logged in email_send_logs
```

---

## Why This Matters

1. **Policy Violation**: You've specified "all app emails through backend except Supabase auth" → this violates that policy
2. **Branding Inconsistency**: SendGrid sends don't get Pretalk branding auto-injection (PRETALK_BRANDING_PARAMS)
3. **Logging Gap**: Lead action emails not recorded in `email_send_logs` table → incomplete audit trail
4. **Provider Consolidation**: Using both Brevo + SendGrid = higher costs, fragmented support
5. **Maintenance Debt**: Two different email providers = double the debugging surface

---

## Lead Actions Hub Events Affected

From `n8n/new/Pretalk_-_Lead_Actions_Hub.json`:

| Node Name | Event Type | Current Provider | Status |
|-----------|-----------|-----------------|--------|
| Send Qualified Email | lead_qualified | SendGrid | ❌ MUST MIGRATE |
| Log Rejection | lead_rejected | SendGrid | ❌ MUST MIGRATE |
| Send Followup | lead_reviewed | SendGrid | ❌ MUST MIGRATE |

---

## Fix Options

### Option A: Migrate SendGrid Nodes to Backend API Call (RECOMMENDED)

**Effort:** 1-2 hours  
**Risk:** Low (adding new node type, not modifying existing logic)  
**Timeline:** BEFORE 27 March 2026

**Steps:**

1. Open `n8n/new/Pretalk_-_Lead_Actions_Hub.json` in n8n editor
2. For each SendGrid node:
   a. Delete SendGrid HTTP node
   b. Create HTTP Request node:
      ```
      Method: POST
      URL: https://api.pretalk.me/api/email/send-template
      Headers:
        - Authorization: Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}
        - Content-Type: application/json
      Body:
        {
          "event_type": "lead_qualified",
          "recipient_email": {{$node["Get Lead Data"].json.email}},
          "recipient_name": {{$node["Get Lead Data"].json.nom_client}},
          "user_id": {{$node["Get Lead Data"].json.user_id}},
          "lead_id": {{$node["Get Lead Data"].json.id}},
          "template_params": {
            "nom_client": {{$node["Get Lead Data"].json.nom_client}},
            "nom_consultant": "{{$env.PRETALK_CONSULTANT_NAME}}",
            "next_steps_url": "https://app.pretalk.me/leads/{{$node["Get Lead Data"].json.id}}"
          }
        }
      ```
3. Test with webhook call → verify email sent + database logged
4. Deploy to production

**Code Example (TypeScript for reference):**

```typescript
// What n8n HTTP node will call:
const payload = {
  event_type: "lead_qualified",
  recipient_email: "client@example.com",
  recipient_name: "Jean Dupont",
  user_id: "user-123",
  lead_id: "lead-456",
  template_params: {
    nom_client: "Jean Dupont",
    nom_consultant: "Marie Martin",
    cta_label: "Voir les propositions"
  }
};

// POST to backend
const response = await fetch('https://api.pretalk.me/api/email/send-template', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

// Response: { success: true, email_id: "email-789", log_id: "log-123" }
```

### Option B: Migrate SendGrid to Brevo in n8n

**Effort:** 2-3 hours  
**Risk:** Medium (requires new Brevo template setup in n8n)  
**Timeline:** OK for Phase 2

**Steps:**

1. In `n8n/new/Pretalk_-_Lead_Actions_Hub.json`, find SendGrid nodes
2. Replace with Brevo "sendInBlue" HTTP nodes
3. Map SendGrid template IDs to Brevo template IDs (from DEPLOYMENT_GUIDE)
4. Test

**Not Recommended:** Still bypasses backend logging, doesn't achieve "backend-only" policy

### Option C: Delete n8n Lead Actions Hub Entirely

**Effort:** 3-4 hours (need fallback mechanism)  
**Risk:** High (could break lead action workflow)  
**Timeline:** Phase 2+

Move all lead action notifications to backend service that:
1. Listens to `lead_status_history` table changes via Supabase realtime
2. Automatically sends email on lead_qualified / lead_rejected transitions
3. Logs to `email_send_logs`

---

## Recommended Solution: Option A (Backend API Call)

### Why:

1. **Fastest:** 1-2 hours to implement
2. **Safest:** Adds new capability, no breaking changes
3. **Achieves Policy:** All lead action emails now logged + branded
4. **Future-Proof:** Single dispatch point for all email types

### Timeline:

- **Today (26 Mar):** Developer migrates SendGrid nodes → backend API calls
- **Tomorrow (27 Mar):** Test in staging, verify emails sent + logged
- **27 Mar Evening:** Deploy to production
- **28 Mar:** Archive n8n Lead Actions Hub, mark SendGrid credentials as deprecated

---

## Verification Checklist

After migration, verify:

```bash
# 1. Trigger lead qualified action from LeadReview UI
curl -X POST https://api.pretalk.me/api/email/send-template \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "lead_qualified",
    "recipient_email": "test@example.com",
    "lead_id": "lead-123"
  }'

# Expected response:
# {
#   "success": true,
#   "email_id": "email-abc123",
#   "log_id": "log-xyz789"
# }

# 2. Verify database logs
SELECT * FROM email_send_logs 
WHERE event_type = 'lead_qualified' 
  AND created_at > NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC LIMIT 1;

# Expected columns: email_id, recipient_email, event_type, status, template_params

# 3. Verify email received
# Check test inbox for email with Pretalk branding

# 4. Check Brevo dashboard
# Navigate: https://app.brevo.com/stats/transactional
# Verify new email counted in daily send volume
```

---

## BLOCKING ACTION ITEMS

### Before Go-Live:

- [ ] **CRITICAL:** Migrate SendGrid nodes in Lead Actions Hub to backend API calls
  - Assigned to: {Developer Name}
  - Deadline: 27 Mar 2026, 5:00 PM
  - Verify: Test 3 lead actions (qualified/rejected/reviewed), confirm emails sent + logged
  
- [ ] **HIGH:** Update n8n webhook triggers to include `Authorization` header if calling backend API
  - Add: `Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  - Reference: DEPLOYMENT_GUIDE_EMAIL_V1.md § Option A
  
- [ ] **HIGH:** Verify no other workflows still using SendGrid
  - Search: `grep -r "SendGrid\|sendgrid\|sg-" n8n/ | grep -v Lead_Actions_Hub`
  - Report: List any other SendGrid references

- [ ] **MEDIUM:** Update docs/PRETALK_COMPLETE_EMAILING.md
  - Add section: "Lead Actions Email Flow"
  - Document POST /api/email/send-template event types: lead_qualified, lead_rejected, lead_reviewed

---

## Rollback Plan

If backend API not ready during Lead Actions migration:

```bash
# Option 1: Keep n8n Lead Actions Hub active with SendGrid (temporary)
# - Acknowledge policy violation
# - Schedule backend API fix for Phase 2
# - Update DEPLOYMENT_GUIDE to note this exception

# Option 2: Disable lead action emails temporarily
# - In app UI: disable "Send Qualified Email" button
# - Note: "Lead actions not emailed during transition"
# - Resume once backend API tested

# To revert:
# 1. Restore n8n Lead Actions Hub from backup (git)
# 2. Keep SendGrid nodes, reactivate workflow
# 3. Log incident for post-mortum
```

---

## Monitoring Post-Migration

Once migrated, monitor these metrics:

```sql
-- Lead action email volume
SELECT
  DATE_TRUNC('day', sent_at) as day,
  COUNT(*) as emails_sent
FROM email_send_logs
WHERE event_type IN ('lead_qualified', 'lead_rejected', 'lead_reviewed')
  AND sent_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', sent_at)
ORDER BY day DESC;

-- Error rate
SELECT
  event_type,
  COUNT(*) FILTER (WHERE status != 'sent') as errors
FROM email_send_logs
WHERE event_type IN ('lead_qualified', 'lead_rejected', 'lead_reviewed')
  AND sent_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type;
```

---

## Questions?

Reference files:
- Implementation: [src/server/routes/emailRoutes.ts](src/server/routes/emailRoutes.ts) (POST /api/email/send-template)
- Frontend example: [src/components/ReactApp/lib/emailApi.ts](src/components/ReactApp/lib/emailApi.ts)
- Full guide: [docs/DEPLOYMENT_GUIDE_EMAIL_V1.md](docs/DEPLOYMENT_GUIDE_EMAIL_V1.md)

**For n8n specific questions:**
- n8n docs: https://docs.n8n.io/nodes/credentials/http/
- Contact: backend@pretalk.me
