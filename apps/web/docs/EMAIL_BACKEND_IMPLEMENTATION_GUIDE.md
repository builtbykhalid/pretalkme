# ✅ Backend Email Implementation - Complete Checklist

## Date: March 26, 2026
## Status: 80% Ready for Local Testing

---

## ✅ COMPLETED

### 1. Infrastructure Setup
- [x] `.env.local` configured with Brevo API keys
- [x] Supabase RLS policy corrected (`user_id` instead of `consultant_id`)
- [x] Database migration: `email_send_logs` table + indexes + RLS policies
- [x] npm install axios ✅

### 2. Backend Services (Already Exist)
- [x] `src/server/services/brevoEmailService.ts` - Main service (Brevo Builder templates)
- [x] `src/server/services/brevoEmailService_v2.ts` - Alternative (Local HTML templates)
- [x] `src/server/services/emailTemplateService.ts` - Template loader
- [x] `src/server/routes/emailRoutes.ts` - POST /api/email/send-template
- [x] Frontend client: `emailApi.ts` - sendAppTemplateEmail()

### 3. HTML Templates: 28 Created ✅
```
✅ delivery_audit (fr, en, es, ar)
✅ delivery_proposition (fr, en, es, ar) 
✅ kickoff_ready (fr, en, es, ar)
✅ new_lead (fr, en, es, ar)
✅ proposal_follow_up (fr, en, es, ar)
✅ contract_signed (fr, en, es, ar)
✅ onboarding_welcome (fr, en, es, ar)
   Total: 28 templates
   Location: src/templates/emails/*.html
```

### 4. Testing Endpoint Created ✅
- [x] GET /api/email/health - Health check
- [x] GET /api/email/templates - List available templates
- [x] POST /api/email/test - Send test email locally (no auth needed)

---

## ⏳ NEXT STEPS (TO EXECUTE)

### STEP 1: Verify Supabase Migration
```bash
# Connect to your Supabase SQL Editor:
# https://app.supabase.com → SQL Editor
# Copy & run: supabase/migrations/email_send_logs_table.sql
```

**Result:** email_send_logs table with 7 columns + 5 indexes + RLS enabled

---

### STEP 2: Update Backend Server Registration

**Edit:** `src/server/index.ts` (or your main server file)

```typescript
// Add this import
import emailTestRouter from './routes/emailTestRoutes.js';

// Add this middleware AFTER auth middleware
app.use('/api/email', emailTestRouter); // Testing endpoints

// Verify existing registration
app.use('/api/email', emailRoutes); // Production endpoints (already exists)
```

**Result:** Backend has both testing + production endpoints

---

### STEP 3: Local Testing

**Start backend:**
```bash
npm run dev
```

**Test Health Check:**
```bash
curl http://localhost:8787/api/email/health
# Response: { "status": "ok", "service": "email-test-endpoint" }
```

**Test List Templates:**
```bash
curl http://localhost:8787/api/email/templates
```

**Send Test Email (LOCAL HTML TEMPLATE):**
```bash
curl -X POST http://localhost:8787/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "delivery_audit",
    "recipient_email": "your-email@example.com",
    "locale": "fr",
    "template_params": {
      "nom_client": "Test Client",
      "nom_consultant": "Test Consultant", 
      "audit_url": "https://pretalk.me/audit/123",
      "audit_summary": "Strong strategic fit"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "event_type": "delivery_audit",
  "recipient_email": "your-email@example.com",
  "locale": "fr",
  "message_id": "email-id-from-brevo",
  "timestamp": "2026-03-26T10:30:00Z"
}
```

---

### STEP 4: Wire Frontend Lead Actions (Option B - Backend Only)

**Edit:** `src/components/ReactApp/lib/leadActions.ts`

```typescript
// ADD THESE IMPORTS
import { sendAppTemplateEmail } from './emailApi';

// MODIFY: triggerLeadQualificationWorkflow()
export async function triggerLeadQualificationWorkflow(leadId: string, leadData: any) {
  // 1. Log action to database (existing code stays)
  await supabase.from('lead_actions').insert({
    lead_id: leadId,
    action_type: 'lead_qualified',
    // ... other fields
  });

  // 2. NEW: Send email to the lead
  try {
    await sendAppTemplateEmail({
      event_type: 'lead_qualified',
      recipient_email: leadData.email,
      lead_id: leadId,
      template_params: {
        nom_client: leadData.nom,
        nom_consultant: leadData.consultant_name
      }
    });
    console.log('Qualification email sent');
  } catch (error) {
    console.error('Failed to send qualification email:', error);
    // Don't fail the whole workflow if email fails
  }
}

// SIMILARLY FOR: triggerLeadRejectionWorkflow() and triggerLeadReviewWorkflow()
// Use event_type: 'lead_rejected' and 'lead_reviewed' respectively
```

---

### STEP 5: Disable n8n Lead Actions (Option B)

**Edit:** `n8n/new/Pretalk_-_Lead_Actions_Hub.json`

**Option B - Disable n8n webhook, use backend only:**

1. Open the n8n workflow file in an editor
2. Find the 2 SendGrid nodes (lines 109, 124)
3. Either:
   - **A) Remove them completely** (safest)
   - **B) Disable them:** Add `"active": false` to each SendGrid node object

**Result:** n8n Lead Actions Hub no longer sends emails. Backend handles via leadActions.ts functions.

---

### STEP 6: Verify Frontend Works

**Test in UI:**

1. Go to Lead Review page → Select a lead
2. Click "Qualify Lead" button → Should see success toast + email logged in `email_send_logs`
3. Verify in Supabase SQL Editor:
```sql
SELECT * FROM email_send_logs 
WHERE event_type = 'lead_qualified' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📊 Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                      │
│  LeadReview + leadActions.ts                            │
│  → sendAppTemplateEmail() function                      │
└────────────────────┬────────────────────────────────────┘
                     │ POST /api/email/send-template
                     │ or /api/email/test
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                   │
│  emailRoutes.ts + emailTestRoutes.js                    │
│  → brevoEmailService_v2.sendByEventType()              │
│     or brevoEmailService.sendTemplateEmail()           │
└────────────────────┬────────────────────────────────────┘
                     │ Use local HTML template
                     │ Load from: src/templates/emails/
                     ▼
┌─────────────────────────────────────────────────────────┐
│              LOCAL HTML TEMPLATES (28 files)            │
│  delivery_audit.fr.html, delivery_audit.en.html, etc.  │
│  Variable substitution: {{brand_name}}, {{action_url}} │
└────────────────────┬────────────────────────────────────┘
                     │ Compile HTML + inject branding
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  BREVO API (SMTP)                       │
│  https://api.brevo.com/v3/smtp/email                   │
│  Auth: Bearer xkeysib-THE_API_KEY                      │
└────────────────────┬────────────────────────────────────┘
                     │ Send email
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 RECIPIENT EMAIL                         │
│  User receives HTML email from: delivery@pretalk.me    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Decisions Made

### Decision 1: Local HTML Templates ✅
- **Why:** No dependency on Brevo dashboard, version-controlled templates, faster iteration
- **Trade-off:** Must maintain templates in code

### Decision 2: Option B - Backend Only (No n8n for emails) ✅
- **Why:** Simpler architecture, all emails flow through same API
- **Trade-off:** n8n becomes document generation only (audit, proposal, devis)

### Decision 3: brevoEmailService_v2 for new code ✅
- **Why:** Acts as wrapper around Brevo API, doesn't require template IDs
- **Trade-off:** Must keep both services for backward compatibility

---

## 🚀 To Get Started

1. **Execute Supabase SQL** (email_send_logs table)
2. **Verify .env.local has real Brevo API key**
3. **Register emailTestRoutes in backend**
4. **Test: curl /api/email/test**
5. **Wire leadActions.ts functions**
6. **Disable n8n SendGrid nodes**
7. **Test in UI (Lead Review)**

---

## 📚 Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `.env.local` | API keys + config | ✅ Updated |
| `supabase/migrations/email_send_logs_table.sql` | DB schema | ✅ Created |
| `src/templates/emails/*.html` | Email HTML (28 files) | ✅ Created |
| `src/server/routes/emailTestRoutes.js` | Testing endpoint | ✅ Created |
| `src/server/routes/emailRoutes.ts` | Production endpoint | ✅ Exists |
| `src/server/services/brevoEmailService_v2.ts` | Local template service | ✅ Exists |
| `src/components/ReactApp/lib/leadActions.ts` | Lead workflows | ⏳ Needs email wiring |
| `n8n/new/Pretalk_-_Lead_Actions_Hub.json` | n8n workflows | ⏳ Needs SendGrid disabled |

---

## ❓ Questions?

If any step fails:
1. Check `.env.local` has valid BREVO_API_KEY
2. Check SUPABASE_SERVICE_ROLE_KEY is not placeholder https://app.supabase.com → Settings → API → Service Role
3. Verify emailTestRoutes registered in server
4. Check console logs for error details
