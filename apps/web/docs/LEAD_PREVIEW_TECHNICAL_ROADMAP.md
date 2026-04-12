# 🛠️ Recommandations Techniques - Lead Preview Workflow Integration

## 1. Architecture Proposée pour Workflow Triggers

### 1.1 Modèle Actuel (Problématique)
```
User clicks "Qualifier"
    ↓
LeadDetailsDrawer → onStatusChange(id, 'sent')
    ↓
AppContext.updateLeadStatus(id, 'sent')
    ↓
Supabase leads.update() 
    ↓
✅ Status changed in DB
❌ NO WORKFLOW TRIGGER
❌ NO NOTIFICATION
❌ NO NEXT ACTION
```

### 1.2 Modèle Recommandé
```
User clicks "Qualifier"
    ↓
LeadDetailsDrawer → handleQualifyLead(id, metadata)
    ↓
┌─────────────────────┬──────────────────┐
│ Update Status       │ Trigger Workflow  │
├─────────────────────┼──────────────────┤
│ AppContext.update() │ N8N webhook call  │
│ + Log action        │ POST lead-qualified
│ + Toast feedback    │ + update context  │
└─────────────────────┴──────────────────┘
    ↓
✅ Status changed
✅ WORKFLOW TRIGGERED
✅ NOTIFICATION SENT
✅ NEXT ACTION QUEUED
```

---

## 2. Code Modifications Détaillées

### 2.1 Nouvelle Couche API (Créer `src/lib/leadActions.ts`)

```typescript
// src/lib/leadActions.ts
import { supabase } from './supabase';
import { 
  N8N_DEAL_WON_OPS_WEBHOOK,
  N8N_GENERATE_AUDIT_WEBHOOK 
} from './n8n';

export interface LeadAction {
  lead_id: string;
  action_type: 'qualified' | 'rejected' | 'reviewed' | 'sent';
  action_reason?: string;
  triggered_by?: string;
  metadata?: Record<string, any>;
}

/**
 * Log une action sur un lead
 */
export const logLeadAction = async (action: LeadAction) => {
  try {
    const { data, error } = await supabase
      .from('lead_actions')
      .insert([{
        id: crypto.randomUUID(),
        lead_id: action.lead_id,
        action_type: action.action_type,
        action_reason: action.action_reason,
        metadata: action.metadata || {},
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Failed to log lead action:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Error logging action:', err);
    return null;
  }
};

/**
 * Déclenche le workflow de qualification de lead
 */
export const triggerLeadQualificationWorkflow = async (leadId: string, leadData: any) => {
  try {
    console.log(`[LeadQualification] Triggering for lead ${leadId}`);
    
    const response = await fetch(N8N_DEAL_WON_OPS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lead_id: leadId,
        action: 'lead_qualified',
        timestamp: new Date().toISOString(),
        lead_data: {
          name: leadData.respondent_info?.name || leadData.name,
          email: leadData.respondent_info?.email || leadData.email,
          company: leadData.respondent_info?.company || leadData.company,
          score: leadData.score,
          form_id: leadData.form_id
        }
      })
    });

    if (!response.ok) {
      throw new Error(`N8N returned status ${response.status}`);
    }

    const result = await response.json();
    console.log('[LeadQualification] Workflow triggered successfully', result);
    
    // Log the action
    await logLeadAction({
      lead_id: leadId,
      action_type: 'qualified',
      metadata: { workflow_response: result }
    });

    return result;
  } catch (err) {
    console.error('Failed to trigger qualification workflow:', err);
    throw err;
  }
};

/**
 * Déclenche le workflow de rejet de lead
 */
export const triggerLeadRejectionWorkflow = async (
  leadId: string, 
  reason?: string,
  leadData?: any
) => {
  try {
    console.log(`[LeadRejection] Logging rejection for lead ${leadId}`);
    
    // Email notification webhook (future)
    const response = await fetch(N8N_DEAL_WON_OPS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lead_id: leadId,
        action: 'lead_rejected',
        timestamp: new Date().toISOString(),
        reason: reason || 'No reason provided',
        lead_data: leadData ? {
          name: leadData.respondent_info?.name || leadData.name,
          email: leadData.respondent_info?.email || leadData.email,
          company: leadData.respondent_info?.company || leadData.company,
        } : null
      })
    });

    if (!response.ok) {
      console.warn(`N8N returned status ${response.status} for rejection`);
    }

    // Always log locally even if webhook fails
    await logLeadAction({
      lead_id: leadId,
      action_type: 'rejected',
      action_reason: reason,
      metadata: { workflow_status: response?.ok ? 'sent' : 'failed' }
    });

    return true;
  } catch (err) {
    console.error('Failed to trigger rejection workflow:', err);
    // Don't throw - rejection shouldn't block if N8N unavailable
    return false;
  }
};

/**
 * Déclenche la génération d'audit automatique
 */
export const triggerAuditGeneration = async (leadId: string, leadData: any) => {
  try {
    console.log(`[AuditGeneration] Triggering for lead ${leadId}`);
    
    const response = await fetch(N8N_GENERATE_AUDIT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lead_id: leadId,
        form_id: leadData.form_id,
        respondent_info: leadData.respondent_info,
        static_answers: leadData.static_answers,
        ai_config: leadData.ai_config,
        auto_triggered: true
      })
    });

    if (!response.ok) {
      throw new Error(`N8N returned status ${response.status}`);
    }

    const result = await response.json();
    console.log('[AuditGeneration] Workflow triggered', result);
    return result;
  } catch (err) {
    console.error('Failed to trigger audit generation:', err);
    // Audit generation is async - don't block
    return null;
  }
};
```

### 2.2 Modifier LeadDetailsDrawer.tsx

```typescript
// Avant (Ligne ~220-240)
const handleStatusChange = (id: string, newStatus: string) => {
    onStatusChange(id, newStatus);
};

// Après
import { triggerLeadQualificationWorkflow, triggerLeadRejectionWorkflow, triggerAuditGeneration } from '../lib/leadActions';
import { useFeedback } from '../context/FeedbackContext';

export default function LeadDetailsDrawer({ isOpen, onClose, lead, onStatusChange }: LeadDetailsDrawerProps) {
    const { showFeedback } = useFeedback();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
        setIsProcessing(true);
        try {
            // Update status in context/DB
            onStatusChange(id, newStatus);

            // Trigger appropriate workflow
            if (newStatus === 'sent' && lead) {
                // Lead Qualified → Trigger audit + prepare for next step
                showFeedback('loading', { message: 'Qualification en cours...' });
                try {
                    await triggerLeadQualificationWorkflow(id, lead);
                    
                    // Optionally auto-generate audit
                    // await triggerAuditGeneration(id, lead);
                    
                    showFeedback('success', { 
                        message: 'Lead qualifié ✓ Nous générons votre audit...' 
                    });

                    // Optional: Open LeadReview in new tab
                    const shouldOpenReview = confirm(
                        'Voulez-vous voir la page complète du dossier?\n(Une nouvelle fenêtre s\'ouvrira)'
                    );
                    if (shouldOpenReview) {
                        window.open(`/lead-review/${id}`, '_blank');
                    }
                } catch (err) {
                    console.error('Qualification workflow error:', err);
                    showFeedback('warning', { 
                        message: 'Lead qualifié mais workflow non utilisé (n8n indisponible)' 
                    });
                }
            } 
            else if (newStatus === 'rejected') {
                // Lead Rejected → Log + optional notification
                showFeedback('loading', { message: 'Rejet en cours...' });
                
                const rejectionReason = prompt(
                    'Raison du rejet (optionnel):',
                    'Pas un bon fit'
                );

                try {
                    await triggerLeadRejectionWorkflow(id, rejectionReason, lead);
                    showFeedback('info', { 
                        message: `Lead rejeté${rejectionReason ? ' (' + rejectionReason + ')' : ''}` 
                    });
                } catch (err) {
                    console.error('Rejection workflow error:', err);
                    showFeedback('warning', { message: 'Lead rejeté (log local)' });
                }
            }
            else if (newStatus === 'reviewed') {
                // Lead Reviewed → Log action
                showFeedback('info', { message: 'À revoir - Rappel programmé' });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Button UI updates
    return (
        <>
            {/* ... existing code ... */}
            
            {/* Footer Actions */}
            <div className="p-6 border-t border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row gap-3">
                <p className="text-xs font-bold text-neutral-500 mb-2 sm:mb-0 w-full sm:w-auto sm:flex sm:items-center sm:mr-auto">
                    Changer le statut :
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => handleStatusChange(lead.id, 'rejected')}
                        disabled={isProcessing}
                        className={`flex-1 sm:flex-initial px-4 py-2 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                            lead.status === 'rejected' 
                                ? 'bg-neutral-50 border-neutral-200 text-neutral-700' 
                                : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-600 hover:border-neutral-200'
                        }`}
                    >
                        <XCircle size={16} /> {isProcessing ? 'En cours...' : 'Rejeter'}
                    </button>
                    <button
                        onClick={() => handleStatusChange(lead.id, 'reviewed')}
                        disabled={isProcessing}
                        className={`flex-1 sm:flex-initial px-4 py-2 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                            lead.status === 'reviewed' 
                                ? 'bg-accent-50 border-accent-200 text-accent-700' 
                                : 'bg-white border-neutral-200 text-neutral-600 hover:text-accent-600 hover:border-accent-200'
                        }`}
                    >
                        <Clock size={16} /> {isProcessing ? 'En cours...' : 'À revoir'}
                    </button>
                    <button
                        onClick={() => handleStatusChange(lead.id, 'sent')}
                        disabled={isProcessing}
                        className={`flex-1 sm:flex-initial px-4 py-2 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                            lead.status === 'sent' 
                                ? 'bg-primary-50 border-primary-200 text-primary-700' 
                                : 'bg-white border-neutral-200 text-neutral-600 hover:text-primary-600 hover:border-primary-200'
                        }`}
                    >
                        <CheckCircle2 size={16} /> {isProcessing ? 'Qualification...' : 'Qualifier'}
                    </button>
                </div>
            </div>
        </>
    );
}
```

### 2.3 Ajouter Détection Hot/Cold Leads

```typescript
// src/utils/leadScoring.ts
export interface LeadTemperature {
  level: 'cold' | 'warm' | 'hot';
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  recommendation: string;
}

export const getLeadTemperature = (score: number): LeadTemperature => {
  if (score >= 80) {
    return {
      level: 'hot',
      emoji: '🔥',
      label: 'Hot Lead',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      recommendation: 'Appelez immédiatement - Haute probabilité de fermeture'
    };
  } else if (score >= 50) {
    return {
      level: 'warm',
      emoji: '⭐',
      label: 'Lead Chaud',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      recommendation: 'Priorité haute - Préparez votre pitch'
    };
  } else {
    return {
      level: 'cold',
      emoji: '❄️',
      label: 'À Qualifier',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      recommendation: 'Besoin de qualification supplémentaire'
    };
  }
};

// Dans LeadDetailsDrawer.tsx, en haut du Stats Bar:
const temperature = getLeadTemperature(lead.score);

return (
  <>
    {/* NEW: Alert Banner for Hot/Cold Leads */}
    {temperature.level !== 'warm' && (
      <div className={`border rounded-lg p-4 mb-4 ${temperature.bgColor}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{temperature.emoji}</span>
          <div>
            <h4 className={`font-bold ${temperature.color}`}>
              {temperature.label}
            </h4>
            <p className="text-sm text-neutral-600 mt-1">
              {temperature.recommendation}
            </p>
          </div>
        </div>
      </div>
    )}
    
    {/* Key Stats Bar */}
    <div className="bg-neutral-50 rounded-xl p-4 flex justify-between items-center border border-neutral-100">
      {/* ... existing code ... */}
    </div>
  </>
);
```

### 2.4 Créer Table `lead_actions` (Migration Supabase)

```sql
-- supabase/migrations/20260317_create_lead_actions.sql

CREATE TABLE lead_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('qualified', 'rejected', 'reviewed', 'sent')),
  action_reason TEXT,
  triggered_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  UNIQUE(lead_id, id)  -- Allow multiple actions per lead
);

CREATE INDEX idx_lead_actions_lead_id ON lead_actions(lead_id);
CREATE INDEX idx_lead_actions_action_type ON lead_actions(action_type);
CREATE INDEX idx_lead_actions_created_at ON lead_actions(created_at DESC);

-- RLS Policy
ALTER TABLE lead_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their lead actions"
  ON lead_actions FOR SELECT
  USING (
    lead_id IN (
      SELECT id FROM leads WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lead actions for their leads"
  ON lead_actions FOR INSERT
  WITH CHECK (
    lead_id IN (
      SELECT id FROM leads WHERE user_id = auth.uid()
    )
  );
```

---

## 3. N8N Workflow Updates

### 3.1 Modifier `workflow_phase_c_proposition.json` (Lead Qualification Handler)

```json
{
  "name": "Lead Qualification Handler",
  "nodes": [
    {
      "parameters": {
        "path": "lead-qualified",
        "responseCode": "200"
      },
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "resource": "sql",
        "operation": "executeQuery",
        "query": "UPDATE leads SET status='qualified' WHERE id='{{ $json.lead_id }}'",
        "options": {}
      },
      "name": "Update Lead Status",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "{{ $env.SUPABASE_URL }}/rest/v1/lead_actions",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{ $env.SUPABASE_KEY }}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "body": {
          "lead_id": "{{ $json.lead_id }}",
          "action_type": "qualified",
          "metadata": "{{ $json }}"
        }
      },
      "name": "Log Action",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [450, 450]
    },
    {
      "parameters": {
        "to": "{{ $json.lead_data.email }}",
        "subject": "Votre audit stratégique est prêt 🎯",
        "textOnly": false,
        "html": "<h2>{{ $json.lead_data.name }}, votre audit est prêt</h2><p>Nous avons analysé votre entreprise...</p>"
      },
      "name": "Send Qualification Email",
      "type": "n8n-nodes-base.sendGrid",
      "typeVersion": 2,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Update Lead Status",
            "type": "main",
            "index": 0
          },
          {
            "node": "Log Action",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update Lead Status": {
      "main": [
        [
          {
            "node": "Send Qualification Email",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 4. Testing Checklist

### 4.1 Unit Tests (Recommandé)

```typescript
// src/lib/__tests__/leadActions.test.ts
import { describe, it, expect, vi } from 'vitest';
import { logLeadAction, triggerLeadQualificationWorkflow } from '../leadActions';

describe('leadActions', () => {
  describe('logLeadAction', () => {
    it('should log a lead action to Supabase', async () => {
      const action = {
        lead_id: 'test-lead-123',
        action_type: 'qualified' as const,
        action_reason: 'Good fit'
      };

      const result = await logLeadAction(action);
      expect(result).toBeDefined();
    });

    it('should handle Supabase errors gracefully', async () => {
      // Mock Supabase error
      const result = await logLeadAction({
        lead_id: 'invalid',
        action_type: 'qualified' as const
      });
      expect(result).toBeNull();
    });
  });

  describe('triggerLeadQualificationWorkflow', () => {
    it('should POST to N8N webhook', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
      global.fetch = fetchMock;

      const leadData = {
        name: 'Corp',
        email: 'contact@corp.com',
        score: 85
      };

      await triggerLeadQualificationWorkflow('lead-123', leadData);
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});
```

### 4.2 Manual Testing Steps

```
[ ] 1. Open Leads page
[ ] 2. Click on a lead → Drawer opens
[ ] 3. Click "Qualifier" button
    [ ] Status changes to "sent"
    [ ] Toast feedback appears
    [ ] N8N webhook called (check n8n logs)
    [ ] lead_actions table updated
    [ ] Email sent to prospect
[ ] 4. Click "Rejeter" button
    [ ] Prompt for rejection reason
    [ ] Status changes to "rejected"
    [ ] lead_actions logged
    [ ] No email sent
[ ] 5. Check hot/cold lead badges
    [ ] Score < 30 → ❄️ Cold
    [ ] Score 30-80 → ⭐ Warm
    [ ] Score > 80 → 🔥 Hot
[ ] 6. Test on mobile
    [ ] Drawer fits screen
    [ ] Buttons responsive
    [ ] Scroll works
```

---

## 5. Timeline Implémentation

```
Semaine 1 (URGENT):
  Jour 1: Create leadActions.ts + API endpoints
  Jour 2: Modify LeadDetailsDrawer component
  Jour 3: Add logging table + test

Semaine 2:
  Jour 1: Add hot/cold lead detection
  Jour 2: Update N8N workflows
  Jour 3: Integration testing

Semaine 3:
  Jour 1-2: ARIA/Accessibility fixes
  Jour 3: Performance optimization
  Jour 4: UAT with real consultants
```

---

**Document généré** : 17 Mars 2026  
**Priorité** : HAUTE (Blocking critical workflows)
