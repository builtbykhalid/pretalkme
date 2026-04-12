# 📋 Plan Correctif - Lead Edit Workflow (Avant/Pendant/Après Meeting)

**Date**: 17 Mars 2026  
**Scope**: Edit Lead Logic + Edit Audit + Associated Workflows  
**Status**: 🚨 CRITICAL GAPS IDENTIFIED

---

## 1️⃣ Carte Complète - Les 3 Phases de la Fonctionnalité

### Phase 1: AVANT LE MEETING (Pre-Call Preparation)

```
Consultant ouvre une lead
        ↓
[DRAWER] LeadDetailsDrawer.tsx
├─ Affiche: Score, Date, Status, Réponses formulaire, Insight IA
├─ Actions: [Rejeter] [À revoir] [Qualifier]
└─ Problem: ❌ Pas de call-to-action "Préparer l'appel"
        ↓
[Review Complet] LeadReview.tsx (nécessite clic "Modifier l'audit")
├─ Affiche: Audit blocks, PDF settings, Chart data, Proposals
├─ Actions: [Générer Audit] [Régénérer] [Voir PDF]
└─ Problem: ⚠️ Deux clicks requis (Drawer → LeadReview)
        ↓
[Prep Questions] Suggested AI questions (MANQUANT)
├─ Affiche: Key objections, Budget points, Decision makers
└─ Problem: ❌ Pas visible dans draw ni LeadReview
        ↓
[Ready Status] "Prêt pour l'appel" (MANQUANT)
└─ Webhook: Update lead.prep_status = true
```

**État Actuel**: ⚠️ Semi-fonctionnel  
**Impact**: Consultant doit ouvrir LeadReview pour vraie préparation

---

### Phase 2: PENDANT LE MEETING (During Call)

```
Consultant lance l'appel avec lead
        ↓
[Notes Recording] Recording session (MANQUANT)
├─ Audio recording via browser/phone
├─ Real-time transcription (optionnel)
└─ Problem: ❌ No recording interface in drawer or LeadReview

[Feeling/Vibe] Prospect sentiment tracking (MANQUANT)
├─ Quick buttons: "🔥 Hot" / "😐 Neutre" / "❌ Not interested"
├─ Real-time save to lead.call_feeling
└─ Problem: ❌ No field, no UI

[Key Points] Objections & Decisions (MANQUANT)
├─ Dedicated tab/panel during call
├─ Auto-fill next questions based on answers
└─ Problem: ❌ Must alt-tab to external notes app

[Timing] Call duration tracking (MANQUANT)
├─ Timer started when drawer opened
├─ Alert if exceeds 45 min
└─ Problem: ❌ No timing UI

[Action Items] Quick task creation (MANQUANT)
├─ User mentions "Faudra envoyer le pricing"
├─ AI pops: "Create follow-up task?"
└─ Problem: ❌ No task management in drawer
```

**État Actuel**: ❌ COMPLETELY ABSENT  
**Impact**: Consultant needs external tools (notes app, Notion, etc.)

---

### Phase 3: APRÈS LE MEETING (Post-Call Actions)

```
Call ends → Consultant marks as "Qualified" (or other status)
        ↓
[Auto Audit Gen] LeadReview triggered with call notes
├─ Webhook: N8N_GENERATE_AUDIT_WEBHOOK
├─ Payload: lead_id + call_feeling + key_notes
└─ Problem: ⚠️ Manual trigger, not auto-fired. Webhook exists but not integrated

[Email Audit PDF] Send generated audit to prospect
├─ LeadReview.tsx has send logic (REVIEWED)
├─ Template customizable via PDF settings
└─ Status: ✅ MOSTLY OK but needs CTA in drawer

[Create Proposal] 3 pricing options (Phase C)
├─ Webhook: N8N_GENERATE_PROPOSAL_WEBHOOK
├─ Payload: audit_data + lead_score + consultant_profile
└─ Problem: ⚠️ Workflow exists. Not auto-linked from drawer. Needs manual trigger.

[Send Contract] Template selection + signature (Phase C continuation)
├─ Workflow: Phase C (Proposal) leads to Phase D (Signature)
├─ PDF generation + Contrato signature link
└─ Problem: ⚠️ Flow exists but requires LeadReview navigation

[Post-Signature Ops] Kickoff form + Finance (Phase D)
├─ Webhook: N8N_DEAL_WON_OPS_WEBHOOK
├─ Payload: verified_contract + lead_email_confirmed
└─ Problem: ⚠️ Workflow exists but no UI to trigger from lead drawer

[Auto Retainer Offer] J+30 reminder + retainer proposal (Phase 5)
├─ Scheduled workflow (N8N)
├─ Trigger: When contract signed + 30 days
└─ Problem: ❌ No retainer workflow visible or configurable
```

**État Actuel**: ⚠️ Workflows exist but NOT auto-triggered from drawer  
**Impact**: Consultant must open LeadReview and trigger manually

---

## 2️⃣ Matrix d'État - Avant/Pendant/Après

| Étape | Feature | Component | Implémentation | Status |
|-------|---------|-----------|-----------------|--------|
| **AVANT** | Lead preview | LeadDetailsDrawer | Vue simple, pas de prépréparation | ✅ 60% |
| **AVANT** | Edit audit prep | LeadReview | Full editing, pas visible drawer | ⚠️ 40% |
| **AVANT** | AI Prep questions | NONE | Hardcoded logic, pas dynamic | ❌ 0% |
| **AVANT** | Ready for call indicator | NONE | No prep status tracking | ❌ 0% |
| **PENDANT** | Audio recording | NONE | No recording UI | ❌ 0% |
| **PENDANT** | Call sentiment | NONE | No feeling field/UI | ❌ 0% |
| **PENDANT** | Notes taking | NONE | Manual, external app | ❌ 0% |
| **PENDANT** | Key points capture | NONE | Manual entry post-call | ❌ 0% |
| **PENDANT** | Call timer | NONE | No timing UI | ❌ 0% |
| **PENDANT** | Task creation | NONE | Manual in external app | ❌ 0% |
| **APRÈS** | Auto audit generation | N8N webhook | Manual trigger required | ⚠️ 50% |
| **APRÈS** | Send audit email | LeadReview UI button | Manual button click | ✅ 70% |
| **APRÈS** | Generate proposal | N8N webhook (Phase C) | Manual trigger required | ⚠️ 50% |
| **APRÈS** | Send contract | Phase C/D workflow | Via separate URL/page | ⚠️ 40% |
| **APRÈS** | Post-sig operations | N8N webhook (Phase D) | Manual or auto-webhook | ⚠️ 50% |
| **APRÈS** | Auto retainer offer | NONE | No workflow configured | ❌ 0% |

**Global Score**: **2.8/10** — Highly fragmented across 2 components

---

## 3️⃣ Les Problèmes Critiques

### PROBLEM #1: Deux Paths Disjoints
**Severity**: 🔴 CRITICAL  
**Where**: `LeadDetailsDrawer.tsx` vs `LeadReview.tsx`  
**Issue**: 
- Consultant ouvre drawer pour quick preview
- Mais TOUTES les actions post-call (audit, devis, contrat) nécessitent LeadReview
- Résultat: Deux interfaces pour le même lead, ni l'une ni l'autre complète

**Flow Actuel**:
```
Drawer opening [action buttons: Reject/Review/Qualify]
  ↓
Status changed in DB
  ↓
❌ NO workflow triggered
  ↓ (si Qualify)
Consultant must go to LeadReview to see options
  ↓
LeadReview opens [action buttons: Generate Audit, Send, etc.]
```

**Impact**: User confusion, inefficiency, 4+ clicks to complete cycle

---

### PROBLEM #2: No Status Flow to Workflows
**Severity**: 🔴 CRITICAL  
**Where**: `LeadDetailsDrawer.handleStatusChange()` → DB only  
**Issue**:
```typescript
// Current code
const handleStatusChange = async (id: string, newStatus: string) => {
    await updateLeadStatus(id, newStatus); // ← Updates DB
    onStatusChange(id, newStatus);         // ← Updates UI
    // ❌ NO WEBHOOK CALL
};
```

**What Should Happen**:
```typescript
if (newStatus === 'sent') {
    // Trigger qualification workflow
    await triggerLeadQualification(id, lead);
    // Webhook: N8N_LEAD_QUALIFIED_WEBHOOK
} else if (newStatus === 'rejected') {
    // Trigger rejection workflow
    await triggerLeadRejection(id, lead);
}
```

**Impact**:
- Consultant clicks "Qualifier" → Nothing visible happens
- N8N workflows never triggered
- Phase C/D operations stuck in limbo
- Lead gets orphaned in qualified status with no action

---

### PROBLEM #3: No Call Meta-Data Capture
**Severity**: 🔴 CRITICAL  
**Where**: `LeadDetailsDrawer` (no call section) + `LeadReview` (no recording)  
**Issue**:
- No UI to record call notes during meeting
- No recording integration (audio/video)
- No sentiment tracking ("was prospect hot?")
- No timer to know call duration

**Current Workaround**:
```
1. Consultant opens drawer
2. Calls prospect (phone/Zoom external)
3. Takes notes in Notes app / Notion
4. Returns to drawer post-call
5. Changes status manually
6. Opens LeadReview to find audit button
7. Generates audit from memory notes
```

**Impact**: Call data loss, delayed workflows, no real-time transcript

---

### PROBLEM #4: Audit Edit Disconnection
**Severity**: 🟠 HIGH  
**Where**: `JsonAuditEditor.tsx` + `AuditEditor.tsx` not integrated in drawer  
**Issue**:
- `JsonAuditEditor` for structured data edit (points forts, recommandations)
- `AuditEditor` for rich text editor (Tiptap-based)
- Neither accessible from LeadDetailsDrawer
- Must open LeadReview, then find audit tab

**Flow**:
```
Consultant wants to edit audit blocks
  ↓
Opens LeadReview (separate page)
  ↓
Clicks "Audit" tab
  ↓
Sees JsonAuditEditor / RichTextEditor split
  ↓
Edits manually or regenerates from N8N
```

**Impact**: 
- Delayed audit delivery
- No real-time audit preview in drawer
- Can't regenerate audit inline
- Saves not immediately visible

---

### PROBLEM #5: Workflows Exist but Not Wired
**Severity**: 🟠 HIGH  
**Where**: N8N workflows in `/n8n/` vs React components  
**Existing Workflows**:
- ✅ `workflow_analyste_rapport_brouillon_v2.json` (Generate Audit)
- ✅ `Pretalk_OS_4_0_Phase_C_v2.json` (Proposals)
- ✅ `Pretalk_OS_4_0_Phase_D_v2.json` (Post-Signature)
- ❌ `Pretalk_-_Lead_Actions_Hub.json` (Lead action router) — PARTIALLY CREATED

**Missing Wiring**:
```typescript
// In LeadDetailsDrawer.tsx
const webhookConfig = {
  qualified: process.env.VITE_N8N_LEAD_QUALIFIED_WEBHOOK,
  rejected: process.env.VITE_N8N_LEAD_REJECTED_WEBHOOK,
  reviewed: process.env.VITE_N8N_LEAD_REVIEWED_WEBHOOK,
};
// ❌ These env vars not set / not used

// Should call on status change:
if (newStatus === 'sent') {
    await fetch(webhookConfig.qualified, {
        method: 'POST',
        body: JSON.stringify({ lead_id, lead_data })
    });
}
```

**Impact**: 
- Workflows run but never triggered from UI
- Lead cascade breaks
- No audit generation post-qualification
- No proposal creation post-audit

---

### PROBLEM #6: No Lead Action Logging
**Severity**: 🟠 HIGH  
**Where**: Database (no history) + N8N (no audit trail)  
**Issue**:
- No `lead_actions` table
- Can't see who qualified/rejected a lead and when
- No context for lead status changes
- Debugging impossible

**Missing Table**:
```sql
CREATE TABLE lead_actions (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  action_type VARCHAR(50), -- 'qualified', 'rejected', 'reviewed', 'audit_sent'
  triggered_by UUID REFERENCES auth.users(id),
  action_reason TEXT,
  action_metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Impact**: 
- No accountability trail
- Can't troubleshoot workflow failures
- Sales team can't see action history per lead

---

## 4️⃣ Plan Correctif Détaillé

### LAYER 1: Enable Drawer → Workflow Triggering

**Goal**: When status changes in drawer, trigger appropriate N8N workflow

#### Task 1.1: Add Webhook Config to .env.local
```env
# Lead action workflows
VITE_N8N_LEAD_QUALIFIED_WEBHOOK=https://n8n.pretalk.me/webhook/lead-qualified
VITE_N8N_LEAD_REJECTED_WEBHOOK=https://n8n.pretalk.me/webhook/lead-rejected
VITE_N8N_LEAD_REVIEWED_WEBHOOK=https://n8n.pretalk.me/webhook/lead-reviewed

# Used for auto-triggers post-action
VITE_N8N_GENERATE_AUDIT_WEBHOOK=https://n8n.pretalk.me/webhook/generate-audit?auto=true
VITE_N8N_GENERATE_PROPOSAL_WEBHOOK=https://n8n.pretalk.me/webhook/generate-proposal?auto=true
```

**File**: `.env.local`  
**Priority**: 🔴 CRITICAL  
**Effort**: 15 min

---

#### Task 1.2: Update LeadDetailsDrawer to Call Webhooks

**Current**:
```typescript
const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
    setIsProcessing(true);
    onStatusChange(id, newStatus);  // ← DB update only
    setIsProcessing(false);
};
```

**New**:
```typescript
import { 
    N8N_LEAD_QUALIFIED_WEBHOOK,
    N8N_LEAD_REJECTED_WEBHOOK,
    N8N_GENERATE_AUDIT_WEBHOOK 
} from '../lib/n8n';

const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
    setIsProcessing(true);
    showFeedback('loading', { message: 'Mise à jour en cours...' });
    
    try {
        // 1. Update DB
        await updateLeadStatus(id, newStatus);
        onStatusChange(id, newStatus);
        
        // 2. Trigger workflow based on status
        if (newStatus === 'sent') {
            // Qualified lead → Generate audit automatically
            const response = await fetch(N8N_LEAD_QUALIFIED_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: id,
                    lead_name: lead.name,
                    lead_email: lead.email,
                    lead_score: lead.score,
                    consultant_id: userProfile?.id,
                    action_timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                showFeedback('success', { 
                    message: 'Lead qualifié ✓ Audit généré...',
                    duration: 4000 
                });
                
                // Optional: Open LeadReview in new tab
                setTimeout(() => {
                    const shouldOpen = window.confirm(
                        'Voulez-vous voir la page complète?\n(Une nouvelle onglet s\'ouvrira)'
                    );
                    if (shouldOpen) {
                        window.open(`/lead-review/${id}`, '_blank');
                    }
                }, 1500);
            } else {
                showFeedback('warning', { 
                    message: 'Lead qualifié mais audit non généré. Tentative dans 30s...',
                    duration: 3000
                });
            }
            
        } else if (newStatus === 'rejected') {
            const rejectionReason = prompt(
                'Raison du rejet?',
                'Ne correspond pas à nos critères'
            );
            
            if (rejectionReason !== null) {
                await fetch(N8N_LEAD_REJECTED_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lead_id: id,
                        lead_name: lead.name,
                        lead_email: lead.email,
                        rejection_reason: rejectionReason,
                        consultant_id: userProfile?.id,
                        action_timestamp: new Date().toISOString()
                    })
                });
                
                showFeedback('info', { 
                    message: `Lead rejeté — ${rejectionReason}`,
                    duration: 3000 
                });
            }
            
        } else if (newStatus === 'reviewed') {
            await fetch(N8N_LEAD_REVIEWED_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: id,
                    lead_name: lead.name,
                    consultant_id: userProfile?.id,
                    review_timestamp: new Date().toISOString()
                })
            });
            
            showFeedback('info', { 
                message: 'À revoir — Rappel programmé',
                duration: 3000 
            });
        }
        
    } catch (err) {
        console.error('Status change error:', err);
        showFeedback('error', { 
            message: 'Erreur: ' + (err as any).message
        });
    } finally {
        setIsProcessing(false);
    }
};
```

**File**: `src/components/ReactApp/components/LeadDetailsDrawer.tsx`  
**Priority**: 🔴 CRITICAL  
**Effort**: 3-4 hours

---

#### Task 1.3: Create/Update Lead_Actions_Hub N8N Workflow

**Purpose**: Router workflow that receives all lead action events and:
1. Logs to Supabase `lead_actions` table
2. Routes to appropriate downstream workflow (Generate Audit, Notify, etc.)
3. Handles retries and error notifications

**Workflow Structure**:
```json
{
  "name": "Pretalk - Lead Actions Hub",
  "nodes": [
    {
      "name": "Webhook - Lead Qualified",
      "path": "webhook/lead-qualified",
      "type": "webhook"
    },
    {
      "name": "Route by Action",
      "type": "if",
      "condition": "body.action_type === 'qualified'"
    },
    {
      "name": "Log Action to DB",
      "type": "supabase",
      "operation": "insert",
      "table": "lead_actions"
    },
    {
      "name": "Fetch Lead Details",
      "type": "supabase",
      "operation": "get",
      "table": "leads"
    },
    {
      "name": "Trigger Generate Audit",
      "type": "http",
      "method": "POST",
      "url": "{{ $env.N8N_GENERATE_AUDIT_WEBHOOK }}"
    },
    {
      "name": "Send Notification",
      "type": "brevo",
      "operation": "send_email"
    }
  ]
}
```

**File**: `n8n/Pretalk_-_Lead_Actions_Hub.json`  
**Priority**: 🔴 CRITICAL  
**Effort**: 4-5 hours

---

### LAYER 2: Add Call Meta-Data Capture

**Goal**: Enable consultant to log call insights during/after meeting

#### Task 2.1: Create Call Session Schema

**Database**:
```sql
-- Add to leads table or create separate call_sessions table
ALTER TABLE leads ADD COLUMN (
  call_recorded_at TIMESTAMP,
  call_duration_seconds INT,
  call_transcript TEXT,
  call_feeling VARCHAR(50), -- 'hot', 'warm', 'cold', 'not_interested'
  call_key_issues TEXT[],
  call_next_steps TEXT[],
  call_decision_timeline VARCHAR(250),
  call_notes_raw TEXT,
  ai_call_summary TEXT
);

-- Or separate table (better):
CREATE TABLE call_logs (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  consultant_id UUID REFERENCES auth.users(id),
  session_started_at TIMESTAMP,
  session_ended_at TIMESTAMP,
  duration_seconds INT,
  transcript_raw TEXT,
  transcript_cleaned TEXT,
  feeling VARCHAR(50),
  key_issues JSONB,
  next_steps JSONB,
  decision_timeline VARCHAR(250),
  notes JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

**File**: `supabase/migrations/20260317_create_call_logs_table.sql`  
**Priority**: 🟠 HIGH  
**Effort**: 1-2 hours

---

#### Task 2.2: Add Call Session Panel to Drawer

**New Component**: `CallSessionPanel.tsx`

```typescript
import { Mic, Play, Pause, Square, Zap, Heart, Brain } from 'lucide-react';

interface CallSessionPanelProps {
    leadId: string;
    isOpen: boolean;
}

export default function CallSessionPanel({ leadId, isOpen }: CallSessionPanelProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [feeling, setFeeling] = useState<'hot' | 'warm' | 'cold' | 'not_interested' | null>(null);
    const [quickNotes, setQuickNotes] = useState('');
    
    return (
        <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-dashed border-primary-200 rounded-xl space-y-4">
            {/* Recording Timer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mic size={18} className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-neutral-400'}`} />
                    <text className="text-sm font-semibold text-dark">
                        {isRecording ? 'ENREGISTREMENT' : 'Appel'}
                    </text>
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-neutral-200">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                
                <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isRecording
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                >
                    {isRecording ? <Square size={14} className="inline mr-1" /> : <Mic size={14} className="inline mr-1" />}
                    {isRecording ? 'Arrêter' : 'Démarrer'}
                </button>
            </div>
            
            {/* Feeling/Sentiment Tracker */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600">📊 Sentimento de l'appel?</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'hot', icon: '🔥', label: 'Hot — Très intéressé' },
                        { id: 'warm', icon: '⭐', label: 'Chaud — À poursuivre' },
                        { id: 'cold', icon: '❄️', label: 'Froid — Hésitant' },
                        { id: 'not_interested', icon: '❌', label: 'Pas intéressé' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setFeeling(opt.id as any)}
                            className={`p-2 text-xs rounded-lg border-2 transition-all text-center font-semibold ${
                                feeling === opt.id
                                    ? 'bg-primary-100 border-primary-500'
                                    : 'bg-white border-neutral-200 hover:border-primary-300'
                            }`}
                        >
                            {opt.icon} {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Quick Notes */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-600">✍️ Notes rapides</label>
                <textarea
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    placeholder="Budget € ? Decision maker ? Objections ? Délai ?"
                    className="w-full p-2 text-xs border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none h-16"
                />
            </div>
            
            {/* Save & Done */}
            <div className="flex gap-2 pt-2 border-t border-primary-200">
                <button className="flex-1 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors">
                    💾 Sauvegarder session
                </button>
                <button className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors">
                    ✨ Générer audit automatique
                </button>
            </div>
        </div>
    );
}
```

**File**: `src/components/ReactApp/components/CallSessionPanel.tsx`  
**Where to Import**: `LeadDetailsDrawer.tsx` — Add tab/collapsible section  
**Priority**: 🟠 HIGH  
**Effort**: 4-5 hours

---

#### Task 2.3: Add Call Session Handler

```typescript
// src/components/ReactApp/lib/callSessionHandler.ts

export const saveCallSession = async (
    leadId: string,
    sessionData: {
        duration_seconds: number;
        feeling: 'hot' | 'warm' | 'cold' | 'not_interested';
        notes: string;
        transcript?: string;
    }
) => {
    // 1. Save to call_logs table
    const { data, error } = await supabase
        .from('call_logs')
        .insert({
            lead_id: leadId,
            duration_seconds: sessionData.duration_seconds,
            feeling: sessionData.feeling,
            notes: sessionData.notes,
            transcript_raw: sessionData.transcript || null,
            session_started_at: new Date(),
            session_ended_at: new Date(),
        });
    
    if (error) throw error;
    
    // 2. Update lead.call_feeling
    await supabase
        .from('leads')
        .update({ call_feeling: sessionData.feeling, call_recorded_at: new Date() })
        .eq('id', leadId);
    
    return data;
};

export const generateAuditFromCall = async (leadId: string) => {
    // Trigger N8N workflow to generate audit from call notes
    const response = await fetch(process.env.VITE_N8N_GENERATE_AUDIT_WEBHOOK, {
        method: 'POST',
        body: JSON.stringify({
            lead_id: leadId,
            source: 'call_session', // vs 'manual' or 'form'
            auto_generate: true,
        })
    });
    
    return response.json();
};
```

**File**: `src/components/ReactApp/lib/callSessionHandler.ts`  
**Priority**: 🟠 HIGH  
**Effort**: 2 hours

---

### LAYER 3: Connect Audit Edit to Lead Drawer

**Goal**: Make audit editing accessible from LeadDetailsDrawer without must-open LeadReview

#### Task 3.1: Add Quick Audit Preview to Drawer

```typescript
// In LeadDetailsDrawer.tsx, add new section:

{/* Audit Preview Section */}
{lead.ai_analysis_json?.audit_blocks && (
    <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-dark text-sm flex items-center gap-2">
                <FileText size={16} className="text-primary-600" />
                Audit Généré
            </h3>
            <button
                onClick={() => window.open(`/lead-review/${lead.id}?tab=audit`, '_blank')}
                className="text-xs px-2 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
                Éditer
            </button>
        </div>
        
        {/* Show first 2 audit blocks as preview */}
        <div className="space-y-2 text-xs">
            {lead.ai_analysis_json.audit_blocks.slice(0, 2).map((block: any) => (
                <div key={block.id} className="p-2 bg-white border border-neutral-100 rounded">
                    <p className="font-semibold text-neutral-700">{block.title}</p>
                    <p className="text-neutral-600 line-clamp-2">{block.content}</p>
                </div>
            ))}
        </div>
        
        {lead.ai_analysis_json.audit_blocks.length > 2 && (
            <p className="text-xs text-neutral-500 mt-2 italic">
                +{lead.ai_analysis_json.audit_blocks.length - 2} other block(s)
            </p>
        )}
        
        <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-200">
            <button className="flex-1 text-xs py-1.5 bg-white border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold">
                📊 Régénérer
            </button>
            <button className="flex-1 text-xs py-1.5 bg-white border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-100 font-semibold">
                📤 Envoyer
            </button>
        </div>
    </div>
)}
```

**File**: `src/components/ReactApp/components/LeadDetailsDrawer.tsx`  
**Priority**: 🟠 HIGH  
**Effort**: 2-3 hours

---

#### Task 3.2: Add Audit Regeneration Button with N8N Trigger

```typescript
const handleRegenerateAudit = async () => {
    setIsProcessing(true);
    showFeedback('loading', { message: 'Régénération de l\'audit...' });
    
    try {
        const response = await fetch(N8N_GENERATE_AUDIT_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lead_id: lead.id,
                force_regenerate: true,
                source: 'drawer',
                form_data: lead.static_answers,
                call_notes: lead.call_notes || null,
                ai_config: lead.form?.ai_config
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showFeedback('success', { 
                message: 'Audit régénéré ✓',
                duration: 3000 
            });
            // Refresh lead data
            await fetchLeadData(lead.id);
        } else {
            showFeedback('error', { message: 'Erreur: ' + response.statusText });
        }
    } catch (err) {
        showFeedback('error', { message: 'Erreur réseau' });
    } finally {
        setIsProcessing(false);
    }
};
```

**File**: `src/components/ReactApp/components/LeadDetailsDrawer.tsx`  
**Priority**: 🟠 HIGH  
**Effort**: 1-2 hours

---

### LAYER 4: Create Lead Action Logging Table & Views

#### Task 4.1: Create Supabase Migration

```sql
-- supabase/migrations/20260317_create_lead_actions_table.sql

CREATE TABLE IF NOT EXISTS lead_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    consultant_id UUID NOT NULL REFERENCES auth.users(id),
    
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'qualified', 'rejected', 'reviewed', 'audit_generated', 
        'audit_sent', 'proposal_generated', 'contract_sent', 
        'contract_signed', 'call_logged', 'note_added'
    )),
    
    action_details JSONB,
    action_reason TEXT,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN (
        'pending', 'completed', 'failed', 'retry'
    )),
    
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_lead_actions_lead_id ON lead_actions(lead_id);
CREATE INDEX idx_lead_actions_consultant_id ON lead_actions(consultant_id);
CREATE INDEX idx_lead_actions_created_at ON lead_actions(created_at DESC);
CREATE INDEX idx_lead_actions_type ON lead_actions(action_type);

-- RLS Policy
ALTER TABLE lead_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lead actions visible to consultant who owns the lead"
    ON lead_actions
    FOR SELECT
    USING (
        consultant_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM leads WHERE 
            leads.id = lead_actions.lead_id AND 
            leads.user_id = auth.uid()
        )
    );

CREATE POLICY "Consultants can only insert their own actions"
    ON lead_actions
    FOR INSERT
    WITH CHECK (consultant_id = auth.uid());

-- Trigger to auto-update updated_at
CREATE TRIGGER update_lead_actions_timestamp
    BEFORE UPDATE ON lead_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**File**: `supabase/migrations/20260317_create_lead_actions_table.sql`  
**Priority**: 🟠 HIGH  
**Effort**: 1-2 hours

---

#### Task 4.2: Create Activity Timeline Component

**New Component**: `LeadActivityTimeline.tsx`

```typescript
// Display all actions on a lead in chronological order
// Shows: Qualified ✓ | Audit Sent | Proposal Created | Contract Signed | Kickoff Started

interface LeadActivityTimelineProps {
    leadId: string;
}

export default function LeadActivityTimeline({ leadId }: LeadActivityTimelineProps) {
    const [activities, setActivities] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchActivities = async () => {
            const { data } = await supabase
                .from('lead_actions')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false });
            
            setActivities(data || []);
        };
        
        fetchActivities();
        
        // Real-time subscription
        const subscription = supabase
            .channel(`lead_actions:${leadId}`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'lead_actions', filter: `lead_id=eq.${leadId}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setActivities(prev => [payload.new, ...prev]);
                    }
                }
            )
            .subscribe();
        
        return () => subscription.unsubscribe();
    }, [leadId]);
    
    const ACTION_ICONS: Record<string, string> = {
        'qualified': '✓',
        'rejected': '✗',
        'audit_generated': '📊',
        'proposal_generated': '💰',
        'contract_signed': '📝',
        'call_logged': '☎️'
    };
    
    return (
        <div className="space-y-2">
            <h3 className="text-xs font-bold text-neutral-600 uppercase">Historique</h3>
            {activities.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">Aucune action enregistrée</p>
            ) : (
                <div className="space-y-2">
                    {activities.map((action, idx) => (
                        <div key={action.id} className="flex items-start gap-2">
                            <div className="text-lg">{ACTION_ICONS[action.action_type] || '○'}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-dark capitalize">
                                    {action.action_type.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-neutral-500">
                                    {new Date(action.created_at).toLocaleString('fr-FR')}
                                </p>
                                {action.action_reason && (
                                    <p className="text-xs text-neutral-600 mt-0.5">{action.action_reason}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

**File**: `src/components/ReactApp/components/LeadActivityTimeline.tsx`  
**Where to Import**: `LeadDetailsDrawer.tsx` + `LeadReview.tsx`  
**Priority**: 🟠 HIGH  
**Effort**: 2-3 hours

---

### LAYER 5: Auto-Trigger Workflows Post-Qualification

**Goal**: When lead status = "qualified", automatically trigger Phase C/D workflows

#### Task 5.1: Update Lead_Actions_Hub N8N Workflow

Modify the N8N workflow to handle auto-triggers:

```json
{
  "nodes": [
    // ... webhook node ...
    {
      "name": "Check if Qualified",
      "type": "if",
      "condition": "{{ $json.action_type === 'qualified' }}"
    },
    {
      "name": "Log Action",
      "type": "supabase",
      "operation": "insert into lead_actions"
    },
    {
      "name": "Auto-Trigger Audit Gen",
      "type": "http",
      "method": "POST",
      "url": "{{ $env.N8N_GENERATE_AUDIT_WEBHOOK }}",
      "body": "$json"
    },
    {
      "name": "Wait 10 seconds",
      "type": "wait",
      "duration": 10000
    },
    {
      "name": "Auto-Trigger Proposal Gen",
      "type": "http",
      "method": "POST",
      "url": "{{ $env.N8N_GENERATE_PROPOSAL_WEBHOOK }}",
      "body": "$json"
    }
  ]
}
```

**File**: `n8n/Pretalk_-_Lead_Actions_Hub.json` (UPDATE)  
**Priority**: 🔴 CRITICAL  
**Effort**: 3-4 hours

---

## 5️⃣ Roadmap d'Implémentation - Phasing

### PHASE 1: CRITICAL FIXES (Semaine 1 — 5 jours)

```
Jour 1:
├─ Task 1.1: .env.local webhooks
└─ Task 4.1: Create lead_actions migration

Jour 2-3:
├─ Task 1.2: Update LeadDetailsDrawer webhook calls
└─ Task 1.3: Setup Lead_Actions_Hub N8N workflow

Jour 4:
├─ Task 4.2: Lead activity timeline component
└─ Testing & validation

Jour 5:
├─ Deploy to Supabase
├─ Import N8N workflow
└─ QA full cycle
```

**Blockers**: None  
**Testing**: Manual end-to-end (Qualified → Audit Gen → Dashboard)  
**Risk**: Medium (N8N webhook timing)

---

### PHASE 2: CALL CAPTURE (Semaine 2 — 3-4 jours)

```
Jour 1-2:
├─ Task 2.1: Create call_logs table
└─ Task 2.2: Build CallSessionPanel component

Jour 3:
├─ Task 2.3: Handler functions
└─ Integration with drawer

Jour 4:
├─ Testing (record, feeling, notes save)
└─ Integrate with audit generation
```

**Blockers**: None  
**Testing**: Browser recording API availability  
**Risk**: Low

---

### PHASE 3: AUDIT EDITING (Semaine 2-3 — 2-3 jours)

```
Jour 1:
├─ Task 3.1: Audit preview in drawer
└─ Task 3.2: Regenerate button + webhook

Jour 2:
├─ Integration testing
└─ Preview → LeadReview navigation

Jour 3:
├─ Mobile responsiveness
└─ QA
```

**Blockers**: None  
**Testing**: Audit generation callback validation  
**Risk**: Low

---

### PHASE 4: AUTO-TRIGGERS (Semaine 3 — 1-2 jours)

```
Jour 1:
├─ Task 5.1: Update N8N workflow
└─ Configure webhook chains

Jour 2:
├─ End-to-end testing
├─ Monitor N8N logs
└─ Failure handling
```

**Blockers**: Existing N8N workflows must be stable  
**Testing**: Multi-step workflow simulation  
**Risk**: High (complex N8N orchestration)

---

## 6️⃣ Success Criteria - Before/After

### BEFORE (Current)
```
Consultant flow:
1. Opens drawer → Sees lead preview (40 sec)
2. Clicks "Qualifier" → Status changes in DB (2 sec)
3. Must manually open LeadReview (5 clicks)
4. Must click "Generate Audit" button (2 sec)
5. Wait for audit to generate (30-120 sec)
6. Manually send audit email (2 sec)
7. Proposes manually from separate page

TOTAL: 7+ minutes, 12+ clicks, 3 different pages
```

### AFTER (Target)
```
Consultant flow:
1. Opens drawer → Sees lead + prep questions (40 sec)
2. Clicks call session "Start" (1 click, 1 sec)
3. Takes notes + sets sentiment (optional, parallel to call)
4. Ends call, clicks "Save + Generate" (1 click, 1 sec)
5. Sees toast: "Audit generado ✓ Proposal incoming..." (5 sec)
6. In background: N8N triggers audit → email → proposal → contract

TOTAL: 2-3 minutes, 4-5 clicks, drawer-centric
BACKGROUND: Audit + Proposal auto-generated in 2-3 minutes
```

---

## 7️⃣ Checklist de Validation

- [ ] .env.local contains all N8N webhook URLs
- [ ] LeadDetailsDrawer calls webhooks on status change
- [ ] Lead_Actions_Hub N8N workflow runs without errors
- [ ] Consultant clicks "Qualifier" → Audit starts generating (check N8N logs)
- [ ] Activity timeline shows actions in real-time
- [ ] Call session panel saves feeling + notes
- [ ] Audit preview shows in drawer
- [ ] "Regenerate Audit" button works
- [ ] Mobile drawer layout not broken
- [ ] No console errors on status change
- [ ] Webhook payloads logged to Supabase
- [ ] End-to-end test: Lead qualified → Audit email sent (< 5 min)

---

## 8️⃣ Risk Register

| Risk | Prob | Impact | Mitigation |
|------|------|--------|-----------|
| N8N webhook timeout | Medium | High | Add retry logic, exponential backoff |
| Call_logs table migration fails | Low | High | Test on staging first, have rollback |
| Consultant disables recording (privacy) | High | Low | Make optional, provide text-only option |
| Audio transcription incorrect | Medium | Medium | Add manual correction UI |
| Activity timeline query slow (many actions) | Low | Medium | Index on lead_id + created_at, pagination |
| Audit generation fails silently | Medium | Critical | Add error logging, webhook status checks |

---

## 9️⃣ Dépendances Externes

- ✅ N8N instance running (existing)
- ✅ Supabase database (existing)
- ⚠️ Browser Recording API (newer browsers may block by default)
- ⚠️ Audio transcription API (optional: Google Speech-to-Text, AssemblyAI)
- ✅ Supabase Real-time subscriptions (existing)

---

## 📞 Questions Ouvertes

1. **Recording Storage**: Where to store call recordings? Supabase Storage, AWS S3, or call transcription service?
2. **Transcription**: Should we auto-transcribe calls? Which API? Cost implications?
3. **Retainer Workflow**: Is there an existing Phase 5 (J+30 retainer) workflow to integrate?
4. **Kick-off Form**: Should kickoff form state be visible in drawer or LeadReview only?
5. **Mobile Recording**: Can users record calls from mobile browsers? Recording API may not work on all devices.

---

## 🎯 Summary

| Aspect | Status | Effort | Value |
|--------|--------|--------|-------|
| **Workflow Triggering** | ❌ Broken | 3-4h | 🔥 Critical |
| **Call Capture** | ❌ Absent | 8-10h | 🔥 High |
| **Audit Editing** | ⚠️ Partial | 4-5h | 🟠 Medium |
| **Activity Logging** | ❌ Absent | 4-5h | 🟠 High |
| **Auto-Triggers** | ⚠️ Config Only | 3-4h | 🔥 Critical |

**Total Effort**: 22-28 hours (~3-4 days solid work)  
**Recommended Timeline**: 3 weeks (PHASE 1 critical, PHASE 2-4 iterative)
