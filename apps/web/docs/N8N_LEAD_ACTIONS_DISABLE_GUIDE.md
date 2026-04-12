# 🔧 Disabling n8n Lead Actions - Option B Implementation

## Overview

Currently, the n8n workflow `Pretalk_-_Lead_Actions_Hub.json` has 2 SendGrid nodes that send emails when leads are qualified/rejected.

**Option B:** Disable these nodes and move all email sending to backend via `leadActions.ts`.

---

## Approach

### Before (Current - n8n sends emails):
```
Frontend Button → n8n Webhook → SendGrid Email
                     ↓
            Sends: qualified/rejected emails
```

### After (Option B - Backend sends emails):
```
Frontend Button → Backend leadActions.ts → sendAppTemplateEmail() → Brevo API
                                                ↓
                        email_send_logs table gets entry
```

---

## How to Disable n8n SendGrid

### Method 1: Remove SendGrid Nodes (Safest)

**File:** `n8n/new/Pretalk_-_Lead_Actions_Hub.json`

1. Open file in VS Code
2. Search for: `"type": "n8n-nodes-base.sendGrid"`
3. You'll find 2 occurrences around lines 109 and 124
4. Delete the ENTIRE node object (including commas, brackets)
5. Clean up JSON structure (check for trailing commas)
6. Save

**Result:** n8n workflow will just log actions, no email sent

---

### Method 2: Disable Nodes (Keep for reference)

If you want to keep them but inactive:

1. Open file in VS Code
2. Find the 2 SendGrid node objects
3. Add `"active": false` to each:
```json
{
  "type": "n8n-nodes-base.sendGrid",
  "active": false,  // <-- ADD THIS LINE
  // ... rest of node config
}
```

**Result:** Nodes stay in workflow but don't execute

---

## Wire Backend Email Sending

Once n8n is disabled, add email sending to `leadActions.ts`:

**File:** `src/components/ReactApp/lib/leadActions.ts`

```typescript
// 1. ADD IMPORT AT TOP
import { sendAppTemplateEmail } from './emailApi';

// 2. FIND: triggerLeadQualificationWorkflow()
// MODIFY TO:

export async function triggerLeadQualificationWorkflow(
  leadId: string, 
  leadData: any
) {
  // Existing code: Log action to database
  try {
    await supabase.from('lead_actions').insert({
      lead_id: leadId,
      action_type: 'lead_qualified',
      user_id: auth.user().id,
      metadata: leadData,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log lead action:', error);
  }

  // NEW: Send email notification
  try {
    await sendAppTemplateEmail({
      event_type: 'lead_qualified',
      recipient_email: leadData.email,
      lead_id: leadId,
      template_params: {
        nom_client: leadData.first_name || 'Client',
        nom_consultant: leadData.consultant_name || 'Consultant',
        action_url: `https://pretalk.me/lead/${leadId}`
      }
    });
    console.log('[LEAD ACTIONS] Qualification email sent to', leadData.email);
  } catch (emailError) {
    // Don't fail the whole workflow if email fails
    console.warn('[LEAD ACTIONS] Email send failed:', emailError.message);
  }
}

// 3. SIMILAR FOR: triggerLeadRejectionWorkflow()
// Change event_type to 'lead_rejected'

export async function triggerLeadRejectionWorkflow(
  leadId: string,
  leadData: any,
  reason?: string
) {
  // Log action
  try {
    await supabase.from('lead_actions').insert({
      lead_id: leadId,
      action_type: 'lead_rejected',
      user_id: auth.user().id,
      metadata: { ...leadData, rejection_reason: reason },
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log rejection:', error);
  }

  // Send rejection email
  try {
    await sendAppTemplateEmail({
      event_type: 'lead_rejected',
      recipient_email: leadData.email,
      lead_id: leadId,
      template_params: {
        nom_client: leadData.first_name || 'Client',
        rejection_reason: reason || 'Not a fit at this time',
        action_url: `https://pretalk.me/support`
      }
    });
    console.log('[LEAD ACTIONS] Rejection email sent');
  } catch (emailError) {
    console.warn('[LEAD ACTIONS] Rejection email failed:', emailError.message);
  }
}

// 4. SIMILAR FOR: triggerLeadReviewWorkflow()
// Change event_type to appropriate 'lead_review_reminder'

export async function triggerLeadReviewWorkflow(
  leadId: string,
  leadData: any
) {
  // Log action
  try {
    await supabase.from('lead_actions').insert({
      lead_id: leadId,
      action_type: 'lead_review_reminder',
      user_id: auth.user().id,
      metadata: leadData,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log review action:', error);
  }

  // Send review reminder email
  try {
    await sendAppTemplateEmail({
      event_type: 'proposal_follow_up', // Use follow-up template or create separate
      recipient_email: leadData.email,
      lead_id: leadId,
      template_params: {
        nom_client: leadData.first_name || 'Client',
        nom_consultant: leadData.consultant_name || 'Consultant',
        review_days_since: '3',
        action_url: `https://pretalk.me/lead/${leadId}`
      }
    });
    console.log('[LEAD ACTIONS] Review reminder email sent');
  } catch (emailError) {
    console.warn('[LEAD ACTIONS] Review reminder email failed:', emailError.message);
  }
}
```

---

## Verification

### Check 1: n8n Workflow Updated
- [ ] Open `n8n/new/Pretalk_-_Lead_Actions_Hub.json`
- [ ] Verify SendGrid nodes are removed OR marked `"active": false`
- [ ] File is valid JSON (use JSON validator if unsure)

### Check 2: leadActions.ts Updated
- [ ] All 3 functions have `sendAppTemplateEmail()` calls
- [ ] Email template_params are filled with relevant data
- [ ] Error handling is in place (try-catch)

### Check 3: Test Workflow
- [ ] Backend running with `/api/email/test` endpoint
- [ ] Go to Lead Review page in UI
- [ ] Click "Qualify Lead" or "Reject Lead"
- [ ] Check:
  - Toast notification appears (success)
  - Email arrives in inbox
  - Check Supabase: email_send_logs table has entry

```sql
-- Verify in Supabase SQL Editor:
SELECT * FROM email_send_logs
WHERE event_type IN ('lead_qualified', 'lead_rejected')
ORDER BY created_at DESC
LIMIT 10;
```

---

## Event Types Available

For lead actions, map to these event types:

| Action | Event Type | Template |
|--------|-----------|----------|
| Qualify Lead | `lead_qualified` | ✅ Created |
| Reject Lead | `lead_rejected` | ✅ Created |
| Review Reminder | `proposal_follow_up` | ✅ Reuse |

---

## rollback Plan (if needed)

If Option B doesn't work, you can quickly rollback:

1. **Restore n8n:** Re-enable SendGrid nodes in workflow
2. **Remove email from leadActions.ts:** Delete the sendAppTemplateEmail() calls
3. **Result:** Back to sending via n8n

---

## Schedule (Recommended)

1. **Day 1:** Disable n8n SendGrid nodes
2. **Day 2:** Wire leadActions.ts functions
3. **Day 3:** Test in UI, verify emails arrive
4. **Day 4:** Monitor email_send_logs, check for failures
5. **Day 5+:** Full rollout to production

---

## Monitoring

After implementation, track email sending:

```sql
-- Email sending stats
SELECT 
  event_type, 
  status, 
  COUNT(*) as count,
  MAX(sent_at) as latest
FROM email_send_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event_type, status;

-- Failed emails
SELECT * FROM email_send_logs
WHERE status = 'failed'
ORDER BY created_at DESC;

-- By date
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_sent
FROM email_send_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

**This completes Option B implementation: Full backend email sending, no n8n SendGrid.**
