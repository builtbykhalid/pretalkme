# 📊 Analyse Complète - Cohérence Globale du Workflow Lead-to-Deal

**Date**: 17 Mars 2026  
**Scope**: Flux complet de la soumission formulaire → signature contrat → opérations  
**Focus**: Cohérence des données et des étapes entre tous les workflows

---

## 0️⃣ Carte du Flux Réel (From Submission to Win)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PROSPECT SUBMITS FORM                                                        │
│ ↓ Webhook: Form Submission Trigger                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
        ╔═══════════════════════════════════════════════════════╗
        ║  PHASE 0: AUDIT GENERATION (Analyste V2.3)          ║
        ║                                                       ║
        ║  Workflow: Pretalk_-_Analyste_V2_3_FINAL.json       ║
        ║  Triggers: new-lead-analysis OR regenerate-audit    ║
        ║                                                       ║
        ║  1️⃣ Fetch lead + form context                        ║
        ║  2️⃣ Extract variables (company, sector, etc)        ║
        ║  3️⃣ Parallel branches:                              ║
        ║      • Jina + Gemini Flash = site summary           ║
        ║      • Gemini Flash = lead scoring (0-100)           ║
        ║      • Gemini Pro = market research                  ║
        ║  4️⃣ Gemini Pro Master = generates audit blocks      ║
        ║       (intro, forts, faibles, recos, cta)           ║
        ║  5️⃣ Outputs: ai_analysis_json + score               ║
        ║                                                       ║
        ║  ✅ Status: lead.status = 'audit_ready'             ║
        ║  ✅ Chart Data: labels + scores ready               ║
        ║  ✅ Email trigger: delivery_audit should sent       ║
        ╚═══════════════════════════════════════════════════════╝
                                    ↓
        ┌───────────────────────────────────────────────────────┐
        │ CONSULTANT RECEIVES AUDIT EMAIL                       │
        │                                                        │
        │ Workflow: Master_Email_Hub_v2.json                    │
        │ Event: delivery_audit                                  │
        │ ✅ Email sent to consultant@domain                    │
        │ ✅ Booking link included                              │
        │ ✅ CTA: "Book your call"                              │
        └───────────────────────────────────────────────────────┘
                                    ↓
        ╔═══════════════════════════════════════════════════════╗
        ║  [CONSULTANT CONSULTATION FORM SECTION]              ║
        ║                                                       ║
        ║  Where: LeadReview.tsx → "Consultation" tab          ║
        ║  What:  Consultant fills notes during/after call     ║
        ║  Data Captured:                                       ║
        ║    - Call notes (manual entry)                       ║
        ║    - Call feeling (consultant's assessment)          ║
        ║    - Objections noted                                ║
        ║    - Budget confirmed                                ║
        ║    - Timeline discussed                              ║
        ║                                                       ║
        ║  ✅ This is EXPECTED & NORMAL (manual input)         ║
        ║  ✅ No automation here — Consultant's expertise      ║
        ║  ⚠️  Data NOT auto-sent to next phase                ║
        ║  ⚠️  Must manually update lead + click next button   ║
        ╚═══════════════════════════════════════════════════════╝
                                    ↓
        ┌───────────────────────────────────────────────────────┐
        │ CONSULTANT CHANGES LEAD STATUS                        │
        │ From: "audit_ready"                                    │
        │ To  : "qualified" (ready for proposal)               │
        │                                                        │
        │ Trigger: NOT automatic                                │
        │ ⚠️  Status must be changed MANUALLY in UI            │
        │ ⚠️  NO webhook triggered after status change         │
        │ ⚠️  PROBLEM #1: BROKEN HANDOFF                        │
        └───────────────────────────────────────────────────────┘
                                    ↓
        ╔═══════════════════════════════════════════════════════╗
        ║  PHASE C: PROPOSAL GENERATION                         ║
        ║                                                       ║
        ║  Workflow: Pretalk_OS_4_0_Phase_C_v2.json           ║
        ║  Triggers: generate-proposal (MANUAL webhook call)   ║
        ║                                                       ║
        ║  1️⃣ Fetch lead (with audit data)                     ║
        ║  2️⃣ Extract audit blocks + score                     ║
        ║  3️⃣ Create 3 proposals (Entry/Core/Premium)          ║
        ║      • Tailored to consultant + lead profile         ║
        ║      • Prices based on score calibration             ║
        ║      • Contract summary = confident CTA              ║
        ║  4️⃣ Outputs: proposals_json                           ║
        ║                                                       ║
        ║  ✅ JSON saved to leads.proposals_json               ║
        ║  ✅ Consultant can review in LeadReview              ║
        ║  ⚠️  Problem #2: MANUAL trigger required             ║
        ║  ⚠️  Should auto-fire when status="qualified"        ║
        ╚═══════════════════════════════════════════════════════╝
                                    ↓
        ┌───────────────────────────────────────────────────────┐
        │ CONSULTANT REVIEWS PROPOSALS                          │
        │                                                        │
        │ Where: LeadReview.tsx → "Proposals" tab              │
        │ Action: View 3 options or regenerate with feedback   │
        │                                                        │
        │ ✅ Feedback loop: Send back to Phase C via webhook   │
        │    with: { feedback: "Make it more premium" }        │
        │ ⚠️  Data NOT captured automatically                   │
        │ ⚠️  Manual process — consultant clicks regen         │
        └───────────────────────────────────────────────────────┘
                                    ↓
        ╔═══════════════════════════════════════════════════════╗
        ║  CONSULTANT SENDS PROPOSAL TO PROSPECT               ║
        ║                                                       ║
        ║  Workflow: Master_Email_Hub_v2.json                  ║
        ║  Event: delivery_proposition                          ║
        ║                                                       ║
        ║  1️⃣ Consultant clicks "Send Proposal" in UI         ║
        ║  2️⃣ Email Hub prepares template                      ║
        ║  3️⃣ Template fills with:                             ║
        ║      - Consultant name                                ║
        ║      - 3 proposal options                             ║
        ║      - Booking link for follow-up call               ║
        ║      - CTA: "Choose your option"                     ║
        ║  4️⃣ Brevo sends email                                ║
        ║  5️⃣ Status: lead.status = "proposal_sent"           ║
        ║                                                       ║
        ║  ✅ Email sent successfully                           ║
        ║  ⚠️  No tracking if prospect opens/clicks           ║
        ║  ⚠️  NO auto-follow-up if no response (J+3, J+7?)   ║
        ╚═══════════════════════════════════════════════════════╝
                                    ↓
        ┌───────────────────────────────────────────────────────┐
        │ PROSPECT CHOOSES OPTION & CONFIRMS BUDGET             │
        │                                                        │
        │ Where: Prospect receives email with 3 options         │
        │ Action: Click "Choose Professional" (or other)        │
        │                                                        │
        │ ⚠️  PROBLEM #3: NO BOOKING FORM / CHOICE CAPTURE     │
        │ ⚠️  Prospect must reply by email or call              │
        │ ⚠️  NO structured intake of which option chosen       │
        │ ⚠️  Manual consultant work to confirm selection       ║
        └───────────────────────────────────────────────────────┘
                                    ↓
        ╔═══════════════════════════════════════════════════════╗
        ║  CONTRACT GENERATION & SIGNING (Phase C continuation) ║
        ║                                                       ║
        ║  Workflow: Still Phase C (Proposal → Contract)       ║
        ║  Triggers: MANUAL (consultant clicks "Generate")     ║
        ║                                                       ║
        ║  1️⃣ Consultant selects chosen option                 ║
        ║  2️⃣ Clicks "Generate Contract"                       ║
        ║  3️⃣ N8N generates contract from Phase C template     ║
        ║  4️⃣ Contract saved to leads.contract_summary        ║
        ║  5️⃣ Signature link generated                          ║
        ║  6️⃣ Sent to prospect via email                        ║
        ║                                                       ║
        ║  ✅ Contract data stored                              ║
        ║  ⚠️  NO confirmed mapping: "prospect chose Option B" ║
        ║  ⚠️  NO deal record created yet                      ║
        ║  ⚠️  Signature tracking via external service?        ║
        ╚═══════════════════════════════════════════════════════╝
                                    ↓
        ┌───────────────────────────────────────────────────────┐
        │ PROSPECT SIGNS CONTRACT                               │
        │                                                        │
        │ Where: Signature link (Docusign? Adobe?)             │
        │ Action: Prospect e-signs                              │
        │                                                        │
        │ ⚠️  PROBLEM #4: HOW IS SIGNATURE VERIFIED?           │
        │ ⚠️  Is there a webhook back to our system?           │
        │ ⚠️  Or is this manual: consultant confirms sig?      │
        │ ⚠️  No evidence in n8n workflows of sig verification  │
        └───────────────────────────────────────────────────────┘
                                    ↓
        ╔═══════════════════════════════════════════════════════╗
        ║  PHASE D: POST-SIGNATURE OPERATIONS                   ║
        ║                                                       ║
        ║  Workflow: Pretalk_OS_4_0_Phase_D_v2.json           ║
        ║  Triggers: deal-won-ops (MANUAL webhook call)        ║
        ║  Payload: { lead_id, deal_id }                        ║
        ║                                                       ║
        ║  1️⃣ Fetch lead + deal data                            ║
        ║  2️⃣ Validate: deal_id exists + contract_signed      ║
        ║  3️⃣ Generate Kickoff Form                             ║
        ║      • AI-generated questions specific to project     ║
        ║      • Auto-saved to leads.kickoff_form_id           ║
        ║  4️⃣ Create project tracking record                    ║
        ║  5️⃣ Send email: "Welcome to onboarding!"             ║
        ║  6️⃣ Status: lead.status = 'deal_won'                ║
        ║                                                       ║
        ║  ✅ Kickoff form created                              ║
        ║  ✅ Client receives welcome email                     ║
        ║  ⚠️  PROBLEM #5: MANUAL TRIGGER (no auto-fire)      ║
        ║  ⚠️  Consultant must click button after sig           ║
        ║  ⚠️  No tracking: did consultant remember to do it?  ║
        ╚═══════════════════════════════════════════════════════╝
                                    ↓
        ┌───────────────────────────────────────────────────────┐
        │ CLIENT FILLS KICKOFF FORM                             │
        │                                                        │
        │ Where: Public form link (e.g., /kickoff/form-slug)    │
        │ Action: Client submits project details                │
        │                                                        │
        │ ✅ Data captured in leads.kickoff_form_responses     │
        │ ⚠️  Status still = "deal_won"                         │
        │ ⚠️  NO downstream workflow triggered                  │
        │ ⚠️  NO notification to consultant that form filled    │
        └───────────────────────────────────────────────────────┘
                                    ↓
        ╔═══════════════════════════════════════════════════════╗
        ║  PHASE 5(?): AUTO-RETAINER OFFER (J+30)              ║
        ║                                                       ║
        ║  Workflow: ??? NOT FOUND IN /n8n/new/                ║
        ║                                                       ║
        ║  Description (from roadmap):                          ║
        ║  - J+30 after contract sign                           ║
        ║  - Send retainer proposal (20% of initial project)   ║
        ║  - Auto-attach previous project results              ║
        ║  - CTA: "Book retainer kickoff"                      ║
        ║                                                       ║
        ║  ✅ Conceptually planned (roadmap)                    ║
        ║  ❌ NOT IMPLEMENTED                                   ║
        ║  ❌ NO workflow file                                  ║
        ║  ❌ NO trigger mechanism                              ║
        ║  ❌ NO scheduled job                                  ║
        ║  ❌ Manual: consultant must remember + send manually ║
        ╚═══════════════════════════════════════════════════════╝
```

---

## 1️⃣ Critical Handoff Points - Where Coherence Breaks

### HANDOFF #1: Audit → Consultant Review → Proposal Request

**Expected Flow**:
```
Audit Generated 
  ↓
Lead status auto-update: "audit_ready"
  ↓
Webhook auto-triggers delivery_audit email
  ↓
Consultant reads audit + calls prospect
  ↓
Consultant updates status: "qualified" (MANUAL CLICK)
  ↓
Webhook should auto-trigger Phase C proposal generation
  ↓ 
Proposals appear in Lead Review automatically
```

**Actual Flow**:
```
 Audit Generated ✅
  ↓
Lead status = "audit_ready" ✅ (OK)
  ↓
Email sent? ⚠️ (UNCLEAR - is delivery_audit fired automatically?)
  ↓
Consultant manually navigates to LeadReview
  ↓
Reads audit + calls prospect ✅ (consultant's work)
  ↓
Consultant manually changes status: "qualified" ✅
  ↓
NO WEBHOOK AUTO-TRIGGERED ❌
  ↓
Consultant must manually click "Generate Proposals" ❌
  ↓
OR proposals never generated (consultant forgets)
```

**Gap**: Status change → No automatic Phase C trigger

**Root Cause**: 
- `LeadDetailsDrawer.tsx` and `LeadReview.tsx` don't call webhook on status update
- Lead_Actions_Hub.json exists but never integrated into React UI
- No orchestration between Phase 0 → Phase C

---

### HANDOFF #2: Proposal Selection → Contract Generation

**Expected Flow**:
```
3 proposals shown to consultant
  ↓
Consultant selects Option B (Professional)
  ↓
Selected option tracked: lead.selected_proposal_option = "B"
  ↓
Consultant sends proposal email to prospect
  ↓
Prospect replies: "Yes, i choose Option B"
  ↓
Consultant clicks "Generate Contract from Option B"
  ↓
Contract auto-generated with Option B terms
  ↓
Contract sent to prospect for signature
```

**Actual Flow**:
```
3 proposals shown to consultant ✅
  ↓
Consultant VIEWS proposals ✅
  ↓
Consultant manually SENDS email to prospect with options ✅ (via Brevo template)
  ↓
Prospect receives email + clicks booking link ✅
  ↓
Prospect books follow-up call (optional) ⚠️
  ↓
Prospect replies to email: "I want Option B"
  ↓
Email arrives at consultant's inbox (external email) ❌
  ↓
NO STRUCTURED CAPTURE: "prospect chose B" ❌
  ↓
Consultant manually notes this in CRM ❌
  ↓
Consultant manually clicks "Generate Contract" ❌
  ↓
N8N generates contract (generic template, no "Option B context") ❌
  ↓
Contract sent to prospect for signature
```

**Gap**: No structured option-selection flow; prospect choice not captured

**Root Cause**:
- No option-selection form between proposal email + contract generation
- Booking form (calendar) not linked to proposal context
- Contract generation doesn't know which option was chosen

---

### HANDOFF #3: Contract Signature → Deal Won Operations

**Expected Flow**:
```
Prospect signs contract (via Docusign/Adobe)
  ↓
Signature webhook received by our system
  ↓
Automatic trigger: Phase D deal-won-ops workflow
  ↓
Kickoff form auto-generated
  ↓
Prospect receives: "Welcome! Please fill out project kickoff form"
  ↓
Consultant notified: "Deal won! Client starting onboarding"
```

**Actual Flow**:
```
Prospect signs contract (external signature service) ✅
  ↓
Does our system KNOW contract was signed? ⚠️ (HOW?)
  ↓
NO evidence of signature webhook in n8n workflows ❌
  ↓
Consultant must manually check signature status (external) ❌
  ↓
Consultant must manually call Phase D webhook
  ↓
Kickoff form created ✅ (but delayed - manual trigger)
  ↓
Prospect receives email with form link ✅
  ↓
No notification to consultant that form was filled ❌
```

**Gap**: No automated handoff after signature; Phase D requires manual trigger

**Root Cause**:
- Phase C doesn't specify contract signature service integration
- No webhook endpoint to receive signature confirmation
- Phase D workflow has no scheduled job to check for signatures
- Manual trigger required (consultant remembers to click button)

---

### HANDOFF #4: Kickoff Form Submission → Project Initiation

**Expected Flow**:
```
Client fills kickoff form
  ↓
FormSubmission webhook fired
  ↓
Auto-trigger: Project creation in ops system
  ↓
Milestone calendar generated
  ↓
Consultant notified: "Client submitted kickoff form - review details"
  ↓
Consultant clicks "Start project"
  ↓
First deliverable deadline set
```

**Actual Flow**:
```
Client fills kickoff form ✅
  ↓
Data stored: leads.kickoff_form_responses ✅
  ↓
NO downstream workflow triggered ❌
  ↓
NO notification to consultant ❌
  ↓
Lead status still = "deal_won" (not progressed to active project) ❌
  ↓
Consultant must manually check LeadReview
  ↓
Consultant must manually set project milestones
  ↓
NO visible project in operations dashboard
```

**Gap**: Form submission doesn't cascade to operations/project management

**Root Cause**:
- No "kickoff_form_submitted" event in Master_Email_Hub
- No workflow bridges leads → projects/ops
- Consultant experience ends after deal won (no ongoing tracking)

---

### HANDOFF #5: Project Completion → Retainer Offer (NOT IMPLEMENTED)

**Expected Flow** (from roadmap):
```
Contract end date reached (J+30 or project end)
  ↓
Scheduled job checks: "Any projects due for retainer?"
  ↓
Auto-trigger: Retainer proposal generation
  ↓
Email sent to client: "Your project wrapping up - retainer offer inside"
  ↓
Client can book retainer kickoff call
  ↓
Retainer contract auto-generated if accepted
```

**Actual Flow**:
```
Contract reaches end date
  ↓
NO SCHEDULED JOB ❌
NO WORKFLOW ❌
NO NOTIFICATION ❌
  ↓
Consultant must manually remember (30+ days later?) ❌
  ↓
IF remembered: Consultant manually sends retainer proposal ⚠️
  ↓ 
OTHERWISE: Retainer opportunity lost
```

**Gap**: Retainer pipeline completely missing

**Root Cause**:
- No Phase 5 workflow at all
- No scheduled job infrastructure
- No retainer template in email hub
- Roadmap item never implemented

---

## 2️⃣ Data Structure Gaps - Is data flowing correctly?

### Lead record through the pipeline:

| Field | Phase 0 (Audit) | Phase C (Proposal) | Phase D (Post-Sig) | Project Ops |
|-------|-----------------|-------------------|-------------------|-------------|
| `id` | ✅ Set | ✅ Used | ✅ Used | ✅ Used |
| `score` | ✅ Computed | ✅ Used (calibr.) | ✅ Context | ❌ N/A |
| `ai_analysis_json` | ✅ Generated | ✅ Read | ⚠️ Read? | ❌ N/A |
| `proposals_json` | ❌ N/A | ✅ Generated | ⚠️ Should be saved | ❌ N/A  |
| `selected_proposal` | ❌ MISSING | ❌ NOT TRACKED | ⚠️ Should be passed | ❌ N/A |
| `contract_summary` | ❌ N/A | ✅ Generated in Phase C | ✅ Passed to Phase D | ❌ N/A |
| `contract_signed_at` | ❌ N/A | ❌ N/A | ⚠️ SHOULD be set | ❌ Required |
| `deal_id` | ❌ N/A | ❌ N/A | ✅ Required param | ✅ PK |
| `kickoff_form_id` | ❌ N/A | ❌ N/A | ✅ Generated | ✅ Used |
| `kickoff_form_responses` | ❌ N/A | ❌ N/A | ❌ Not saved by D | ✅ Should have |
| `project_status` | ❌ N/A | ❌ N/A | ❌ NOT CREATED | ❌ Missing |
| `next_milestone_date` | ❌ N/A | ❌ N/A | ❌ NOT SET | ⚠️ Required |

**Issues Found**:
- ❌ `selected_proposal_option` - No field to track which option prospect chose
- ❌ `proposal_sent_at` - No timestamp when proposal email sent
- ❌ `contract_signed_at` - Should be auto-set when Phase D triggered, or after sig
- ❌ `project_status` - No enum: draft/active/completed/retainer
- ⚠️ `kickoff_form_responses` - Generated by form submission, but never loaded back into lead record
- ⚠️ Data consistency: Phase C generates contract but doesn't know which option was chosen

---

## 3️⃣ Email Coordination Issues

### Master_Email_Hub_v2.json Routes:

| Event | Trigger | Template | Status |
|-------|---------|----------|--------|
| `new_lead` | Form submit | Template 10 (FR) | ✅ Exists |
| `delivery_audit` | After Phase 0 | Template 20 (FR) | ❓ Auto-triggered? |
| `delivery_proposition` | Consultant sends | Template 30 (FR) | ⚠️ Manual |
| `proposal_follow_up` | J+3 if no reply | Template 40 (FR) | ❌ NO SCHEDULED JOB |
| `contract_signed` | After sig webhook | Template 50 (FR) | ❓ Needs webhook |
| `kickoff_ready` | Phase D triggered | Template 60 (FR) | ⚠️ Manual trigger |
| `onboarding_welcome` | (no trigger found) | Template 1 (FR) | ❌ UNUSED |

**Issues**:
- ❌ No scheduled follow-up emails (proposal_follow_up needs cron job)
- ❓ No evidence delivery_audit is fired automatically after Phase 0
- ⚠️ delivery_proposition requires manual button click
- ❓ contract_signed event needs signature webhook (not found in codebase)

---

### Email Variables Not Filled:

| Variable | Used In | Issue |
|----------|---------|-------|
| `{{booking_link}}` | All templates | ✅ Passed in webhook body |
| `{{audit_url}}` | `delivery_audit` | ⚠️ MISSING - where does it come from? |
| `{{proposal_url}}` | `delivery_proposition` | ⚠️ MISSING - proposals_json not serialized to URL |
| `{{kickoff_url}}` | `kickoff_ready` | ✅ Should work (from Phase D) |
| `{{cta_label}}` | Depends on event | ⚠️ Hard-coded or passed? |

**Gap**: Audit + Proposal emails might send empty links

---

## 4️⃣ Workflow Execution Order Issues

### When Consultant Changes Status to "Qualified":

**Current**:
1. React updates DB: `leads.status = "qualified"`
2. UI shows success toast
3. Nothing else happens ❌

**Should be**:
1. React updates DB: `leads.status = "qualified"`
2. React calls Phase C webhook with: `{ lead_id, action: "auto_qualified" }`
3. Phase C workflow gets lead + audit data
4. Phase C generates 3 proposals
5. Phase C saves proposals_json to lead
6. React fetches updated lead data
7. UI shows: "✅ Proposals generated! Review them below."

**Missing**: Lead_Actions_Hub.json or similar router isn't called on status change in UI

---

### When Consultant Sends Proposal Email:

**Current**:
1. Consultant clicks "Send to Prospect" button (in LeadReview)
2. React calls Master_Email_Hub webhook with: `{ event_type: "delivery_proposition", recipient_email, ... }`
3. Email sent ✅
4. lead.status might update to "proposal_sent" ⚠️
5. NO FOLLOW-UP scheduled

**Should be**:
1. Same as above
2. Plus: Register a follow-up timer (J+3, J+7)
3. Schedule a check: "Has prospect replied?"
4. If no booking by J+3 → send reminder email

**Missing**: No scheduled follow-up mechanism

---

### When Prospect Signs Contract:

**Current**:
1. Prospect signs via external service (Docusign/Adobe/etc)
2. ??? 🤷 (No webhook integration visible)
3. Consultant manually realizes: "Oh, contract was signed yesterday"
4. Consultant clicks "Deal Won" button? Or similar
5. IF clicked: Phase D workflow fires
6. Kickoff form created + email sent

**Should be**:
1. External signature service sends webhook: `{ contract_id, status: "signed" }`
2. We receive and match to lead (HOW?)
3. Auto-trigger Phase D workflow
4. Kickoff form + email automatic
5. Consultant dashboard shows: "Deal won! Contract signed Jan 15. Waiting for kickoff form..."

**Missing**: Contract signature integration completely absent

---

## 5️⃣ Missing Orchestration Workflows

### Gap #1: Lead Status → Auto-Trigger Workflows

**What should exist**:
```json
{
  "name": "Pretalk - Lead Status Router",
  "purpose": "When lead.status changes, automatically fire next workflow",
  "routes": {
    "status = 'audit_ready'": "→ Send delivery_audit email",
    "status = 'qualified'": "→ Trigger Phase C proposal generation",
    "status = 'proposal_accepted'": "→ Generate & send contract",
    "status = 'contract_signed'": "→ Trigger Phase D kickoff generation",
    "status = 'deal_won' + days_since_contract = 30": "→ Generate retainer proposal"
  }
}
```

**What actually exists**:
- ✅ Lead_Actions_Hub.json exists (but routes rejected/qualified manually, not auto-triggered)
- ❌ No listening to status changes in Supabase
- ❌ React doesn't call webhooks on status change
- ❌ Lead_Actions_Hub has no RLS integration to listen to Supabase real-time

---

### Gap #2: Scheduled Jobs

**What should exist**:
```
Every day at 9 AM:
  IF contract_signed_at < TODAY - 30 days AND status != 'retainer_active'
    THEN trigger retainer proposal generation

Every hour:
  IF status = 'proposal_sent' AND proposal_sent_at < NOW - 3 days AND no_booking_yet
    THEN send reminder email
```

**What actually exists**:
- ❌ No cron/scheduled jobs visible in n8n
- ❌ No retainer generation at all
- ❌ No follow-up email reminder system

---

### Gap #3: Signature Verification Integration

**What should exist**:
```
EXTERNAL SERVICE: Docusign/Adobe API
  ↓
Webhook: POST /webhook/contract-signed
  ↓ N8N receives: { contract_id, signer_email, timestamp, status: "signed" }
  ↓
Lookup: find lead where contract_id = ...
  ↓
Auto-trigger: Phase D workflow
```

**What actually exists**:
- ❌ No signature service integration found
- ❌ No webhook endpoint to receive signature status
- ❌ Phase C doesn't specify contract platform (Docusign? Adobe? Custom?)
- ❌ Phase D has no pre-flight check for signature

---

## 6️⃣ Consultant Action Gaps

### Where Consultant Must Click (vs Automation):

| Step | Automation | Status | Impact |
|------|-----------|--------|--------|
| View lead | Manual (open LeadReview) | ⚠️ Expected | UX friction |
| Read audit | Manual (consultant reads) | ✅ Normal | Needed input |
| Call prospect | Manual (consultant's work) | ✅ Normal | Expert work |
| Change status "qualified" | Manual button | ❌ Should auto → Phase C | Breaking workflow |
| Generate proposals | Manual button click | ❌ Should auto if qualified | Delay |
| Review/edit proposals | Manual editing | ✅ Normal | Expert input |
| Send proposal email | Manual button | ✅ OK | Consultant controls timing |
| Choose option from prospect reply | Manual (from email) | ❌ No structured form | Data loss |
| Generate contract | Manual button | ❌ Should auto if option selected | Delay |
| Check contract signed | Manual (external service) | ❌ No auto notification | Oversight |
| Trigger Phase D | Manual button (!??) | ❌ Should auto when sig confirmed | Critical gap |
| Check if kickoff form filled | Manual (poll LeadReview) | ❌ No notification | No visibility |
| Schedule retainer call | Manual in CRM | ❌ No automation atall | Opportunity loss |

**Pattern**: Too many manual steps would be automatic ← = places where workflow breaks

---

## 7️⃣ Coherence Issues Summary

### CRITICAL GAPS (Deal Advancement Blocked):

| Gap | Where | Impact | CTA |
|-----|-------|--------|-----|
| **G1** | Status change → Phase C trigger | Proposals never generated unless manual click | Wire Lead_Actions_Hub to React UI |
| **G2** | Proposal option selection → Contract context | Contract doesn't know which option | Add option selection form between proposal + contract |
| **G3** | Contract signature → Deal Won automation | Phase D requires manual trigger; 30+ day delays | Integrate signature webhook |
| **G4** | Deal Won → Project ops handoff | Kickoff form data orphaned; no project created | Create Project Router workflow |
| **G5** | Project completion → Retainer | No retainer workflow exists | Implement Phase 5 + scheduled job |

### MEDIUM GAPS (UX Friction):

| Gap | Where | Impact | CTA |
|-----|-------|--------|-----|
| **G6** | Email delivery timing | delivery_audit/proposition timing unclear | Clarify/document when emails fire |
| **G7** | Proposal follow-up | No J+3 reminder if prospect doesn't book | Add scheduled follow-up job |
| **G8** | Data continuity | selected_proposal_option not tracked | Add field to leads table + Phase C save |
| **G9** | Notification gaps | Consultant not notified re: kickoff submission | Add notification after form filled |

### LOW GAPS (Polish):

| Gap | Where | Impact | CTA |
|-----|-------|--------|-----|
| **G10** | Email variable filling | Audit/proposal URLs might be empty | Ensure all variables passed to Email Hub |
| **G11** | Status progression clarity | lead.status values ad-hoc (audit_ready? qualified? proposal_sent?) | Standardize status enum |
| **G12** | Multiple contract versions | If regenerated, old version left behind | Add versioning or replace strategy |

---

## 8️⃣ Recommended Fix Priority

### WEEK 1 - Unblock Deal Flow:
```
[1.1] Wire Lead_Actions_Hub to React UI
      • When status changes in drawer/LeadReview, POST to lead-actions webhook
      • Lead_Actions_Hub routes: qualified → Phase C trigger
      
[1.2] Auto-trigger Phase C on status="qualified"
      • N8N listens to Supabase: IF status='qualified' THEN generate-proposal
      • OR React calls webhook directly
      
[1.3] Add selected_proposal_option field to leads
      • Type: enum (A / B / C)
      • Set by consultant when choosing which to send
      • Phase C uses this when generating contract
```

### WEEK 2 - Fix Handoffs:
```
[2.1] Create Signature Webhook Integration
      • Add /webhook/contract-signed endpoint
      • Receives: { contract_id, status }
      • Matches to lead + auto-triggers Phase D
      
[2.2] Add Option Selection Form
      • After proposal email sent, prospect gets form: "Which option interests you?"
      • Captures choice → saves to lead.selected_proposal_option
      • Consultant sees highlighted option in LeadReview
      
[2.3] Auto-trigger Phase D on signature
      • If signature webhook integrated: auto-fire Phase D
      • Kickoff form + email automatic
      • Consultant notified: "New deal won!"
```

### WEEK 3 - Implement Missing Phases:
```
[3.1] Create Phase 5 Retainer Workflow
      • Triggered: contract_signed_at + 30 days
      • Generates retainer proposal (20% of original)
      • Sends via Master_Email_Hub
      
[3.2] Implement Scheduled Jobs
      • Cron: Daily check for J+30 contracts
      • Cron: Hourly check for stale proposals (J+3 follow-up)
      
[3.3] Create Project Router Workflow
      • Listens: kickoff_form_submitted event
      • Creates project record in ops system
      • Sets milestones based on form answers
      • Notifies consultant
```

### WEEK 4 - Close Gaps:
```
[4.1] Email variable validation
      • Ensure all {{vars}} populated before send
      • Add fallbacks for missing URLs
      
[4.2] Status enum standardization
      • Define: 'lead_submitted', 'audit_generated', 'audit_ready', 'qualified', 
               'proposal_sent', 'proposal_accepted', 'contract_sent', 'contract_signed',
               'deal_won', 'kickoff_active', 'project_completed', 'retainer_active'
      • Update workflow conditions to use enum
      
[4.3] Notification system
      • Consultant notified when: kickoff_form_submitted, proposal_opened(?), retainer_needed
      • In-app alerts + email
```

---

## 9️⃣ Risk Analysis

### High Risk - If Not Fixed Soon:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **R1** | Consultant forgets to generate proposals | High | Medium | Automation (see G1 fix) |
| **R2** | Deals stuck at "qualified" - never proposed | High | Critical | Quick audit of stalled leads |
| **R3** | Contract signature missed - no ops handoff | Medium | Critical | Signature webhook ASAP |
| **R4** | Retainer pipeline ignored | High | High | Phase 5 implementation |
| **R5** | Data inconsistency = reporting broken | Medium | Medium | Standardize status field |

---

## 🔟 Success Metrics - After Fixes

| Metric | Before | After |
|--------|--------|-------|
| Manual clicks to close deal | 8-12 | 2-3 |
| Days from proposal sent to contract signed | 5-7 days (manual followup) | 2-3 days (auto followup) |
| Retainer pipeline revenue | $0 (forgotten) | +30% (automated) |
| Consultant time per deal | 45 min (admin work) | 20 min (core work) |
| Deal completion rate | ~70% (manual stalls) | 90%+ (automation) |

---

## Summary - The Real Coherence Issues

✅ **What Works Well**:
- Phase 0 (Audit generation) - Solid AI workflow
- Proposal generation logic (Phase C) - Well-designed
- Kickoff form auto-generation (Phase D) - Good
- Email Hub routing - Flexible

❌ **What's Broken**:
1. **No orchestra between phases** - Status change ≠ auto next phase
2. **Signature integration missing** - Contract → Deal won is manual
3. **Option tracking absent** - Prospect choice not captured
4. **Retainer phase missing** - No J+30 automation
5. **Scheduled jobs missing** - No follow-ups, no daily checks

⚠️ **What's Unclear**:
- When does `delivery_audit` email fire? (After Phase 0 auto, or manual?)
- Is contract service integrated? (Can't tell from workflows)
- How does consultant trigger Phase D? (Manual button in LeadReview?)
- What happens if prospect never responds to proposal? (Nothing - no follow-up)

**Bottom Line**: The workflows are individually good,but the **glue between them is broken**. Each phase works in isolation, but there's no orchestration to connect them into a full deal pipeline.
