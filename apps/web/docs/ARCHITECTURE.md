# 🏗️ Lead Preview UX - Architecture Diagram

## Flow Diagram: Lead Qualification Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRETALK LEAD PREVIEW                         │
│                  (LeadDetailsDrawer Component)                  │
└─────────────────────────────────────────────────────────────────┘

                            USER ACTIONS
                         ↙ ↓ ↓ ↓ ↓ ↓ ↓ ↘
                                                                  
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │  REJETER ❌  │   │ À REVOIR ⏱️  │   │ QUALIFIER ✅ │  BUTTONS
    └──────────────┘   └──────────────┘   └──────────────┘
           │                   │                 │
           ↓                   ↓                 ↓
    ╔════════════════╗ ╔══════════════════╗ ╔═════════════════╗
    ║ HANDLER        ║ ║ HANDLER          ║ ║ HANDLER         ║
    ║ Prompt reason  ║ ║ Create reminder  ║ ║ Trigger workflow║
    ║ Log action     ║ ║ Log action       ║ ║ Update status   ║
    ║ Show toast     ║ ║ Show toast       ║ ║ Log action      ║
    ╚════════════════╝ ╚══════════════════╝ ╚═════════════════╝
           │                   │                 │
           └───────────────────┼─────────────────┘
                               ↓
            ┌──────────────────────────────────────┐
            │   LEAD ACTIONS SERVICE               │
            │   src/lib/leadActions.ts             │
            │  ╔══════════════════════════════╗   │
            │  ║ - Status update              ║   │
            │  ║ - Workflow trigger           ║   │
            │  ║ - Action logging             ║   │
            │  ║ - Error handling              ║   │
            │  ╚══════════════════════════════╝   │
            └──────────────────────────────────────┘
                    ↓              ↓
          ┌─────────────────┐  ┌──────────────────┐
          │ SUPABASE LEADS  │  │ N8N WEBHOOKS     │
          │ TABLE           │  │ (3 routes)       │
          ├─────────────────┤  ├──────────────────┤
          │ id: UUID        │  │ deal-won-ops     │
          │ status: TEXT    │  │    (Qualified)   │
          │ updated_at: TS  │  │                  │
          │ ...more...      │  │ lead-actions-hub │
          │                 │  │    (All types)   │
          └─────────────────┘  │                  │
             UPDATE LEAD       │ generate-proposal│
                               │    (Auto audit)  │
                               └──────────────────┘
                                    ↓
                        ┌───────────────────────┐
                        │ SYSTEM ACTIONS        │
                        ├───────────────────────┤
                        │ • Send emails         │
                        │ • Generate proposals  │
                        │ • Create kickoff form │
                        │ • Update CRM          │
                        │ • Create calendar evt │
                        └───────────────────────┘
```

---

## Component Hierarchy

```
App / React Router
│
├─ Leads.tsx (Page)
│  │
│  ├─ KanbanBoard.tsx
│  │  │
│  │  └─ LeadCard
│  │     │
│  │     └─ onClick → setSelectedLead()
│  │
│  └─ LeadsList.tsx
│     │
│     └─ LeadRow
│        │
│        └─ onClick → setSelectedLead()
│
└─ LeadDetailsDrawer (Modal)     ← 👈 THIS COMPONENT
   │
   ├─ LeadAvatar
   ├─ LeadScoreBadge
   ├─ StatusBadge
   │
   └─ ACTION HANDLERS
      │
      ├─ handleQualify()
      │  └─ triggerLeadQualificationWorkflow()
      │
      ├─ handleReject()
      │  └─ triggerLeadRejectionWorkflow()
      │
      └─ handleReview()
         └─ triggerLeadReviewWorkflow()
```

---

## Data Flow: Status Change to Notification

```
┌─────────────────────────────────────────────────────┐
│ 1. USER CLICKS "QUALIFIER"                          │
│    ↓                                                │
│    setProcessing(true)                             │
│    setProcessingAction('sent')                     │
│    showFeedback('loading')                         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 2. UPDATE LEAD STATUS                              │
│    ↓                                                │
│    await updateLeadStatus(id, 'sent')              │
│    → supabase.from('leads').update()               │
│       WHERE id = id                                │
│    ↓ ✅ Updated in DB                             │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 3. TRIGGER N8N WEBHOOK                             │
│    ↓                                                │
│    await triggerLeadQualificationWorkflow()        │
│    → POST to N8N_DEAL_WON_OPS_WEBHOOK              │
│       Payload: {lead_id, action, lead_data}       │
│    ↓ ✅ Webhook called                            │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 4. N8N PROCESSING                                  │
│    ├─ Get Lead from Supabase                       │
│    ├─ Validate trigger                            │
│    ├─ Log action to lead_actions table             │
│    ├─ Send email notification                      │
│    └─ Return response                              │
│    ↓ ✅ N8N complete                              │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 5. FEEDBACK TO USER                                │
│    ├─ setProcessing(false)                         │
│    ├─ setProcessingAction(null)                    │
│    ├─ showFeedback('success', message)             │
│    └─ Offer to open LeadReview                     │
│    ↓ ✅ UX complete                               │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema: lead_actions

```sql
lead_actions (Audit Trail)
├─ id (UUID PK)
├─ lead_id (UUID FK → leads.id)
├─ action_type (TEXT: qualified|rejected|reviewed|...)
├─ action_reason (TEXT, nullable)
├─ triggered_by (UUID FK → auth.users.id)
├─ metadata (JSONB: {workflow_response, duration_ms, error?})
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)

INDEXES:
├─ lead_id (Fast lookup per lead)
├─ action_type (For filtering)
├─ created_at DESC (Recent actions first)
└─ triggered_by (For user activity)
```

---

## Temperature Detection Logic

```
Lead Score Analysis
        │
        ├─ score >= 80 → 🔥 HOT LEAD
        │   └─ Recommendation: "Call immediately"
        │   └─ Urgency: HIGH
        │   └─ Display: Alert banner + emoji
        │
        ├─ 50 <= score < 80 → ⭐ WARM LEAD  
        │   └─ Recommendation: "Follow up in 24h"
        │   └─ Urgency: MEDIUM
        │   └─ Display: No banner (normal)
        │
        └─ score < 50 → ❄️ COLD LEAD
            └─ Recommendation: "Qualification needed"
            └─ Urgency: LOW
            └─ Display: Alert banner + emoji
```

---

## Error Handling Flow

```
Action Triggered
    │
    └─ Try {
        ├─ Update status
        ├─ Trigger workflow
        ├─ Log action
        └─ Show feedback
      }
         │
         └─ Catch {
            ├─ Log error to console
            ├─ Attempt partial rollback
            ├─ Show error toast
            └─ Return gracefully
           }
             │
             └─ Finally {
                ├─ setProcessing(false)
                ├─ setProcessingAction(null)
                └─ Enable buttons
               }
```

---

## File Dependencies

```
LeadDetailsDrawer.tsx
├─ imports/
│  ├─ leadActions.ts ✅
│  ├─ leadTemperature.ts ✅
│  ├─ FeedbackContext
│  ├─ LeadScoreBadge (ui/)
│  ├─ StatusBadge (ui/)
│  └─ LeadAvatar (ui/)
└─ exports/
   └─ Component <LeadDetailsDrawer />
      └─ used in Leads.tsx
```

---

## Mobile Responsiveness Adaptation

```
DESKTOP (> 768px)           MOBILE (< 768px)
┌──────────────────┐       ┌──────────────────┐
│ [Avatar] Name    │       │ [Sm] Name        │
│        Company   │       │      Company     │
│ [X Close]        │       │ [X]              │
├──────────────────┤       ├──────────────────┤
│ Score|Date|Stat  │       │ S|D|St           │
│ (3 cols)         │       │ (3 cols)         │
├──────────────────┤       ├──────────────────┤
│                  │       │                  │
│ Content (p-6)    │       │ Content (p-4)    │
│                  │       │                  │
├──────────────────┤       ├──────────────────┤
│ Rejeter|À revoir │       │ Rej|Rev|Qual     │
│ Qualifier        │       │ (3 rows if tiny) │
│ (3 inline)       │       │ (3 cols)         │
└──────────────────┘       └──────────────────┘
```

---

## Integration Testing Strategy

```
UNIT TESTS
├─ getLeadTemperature(score) → correct level
├─ getNextActionRecommendation(score) → correct text
└─ logLeadAction(action) → returns boolean

INTEGRATION TESTS
├─ Qualify flow end-to-end
│  ├─ Status updates
│  ├─ Webhook called
│  ├─ lead_actions logged
│  └─ Feedback shown
├─ Reject flow with reason
├─ Review flow with reminder
└─ Error scenarios
   ├─ N8N down
   ├─ Supabase down
   └─ Network timeout

E2E TESTS
├─ Hot Lead path (score > 80)
├─ Cold Lead path (score < 50)
├─ Mobile redraw
└─ Accessibility (keyboard + screen reader)
```

---

## Performance Targets

```
Metric                 Target    Actual
─────────────────────────────────────────
Status update time     < 500ms    ⏱️
N8N webhook latency    < 2s       ⏱️
Toast display time     instant    ⏱️
Mobile drawer render   < 300ms    ⏱️
Bundle size increase   < 15KB     ⏱️
Memory overhead        < 2MB      ⏱️
```

---

**Architecture Version** : 1.0  
**Last Updated** : 17 Mars 2026  
**Status** : ✅ Ready for implementation
