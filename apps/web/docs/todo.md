## Plan d'action complet — Agent IA : Refonte Lead Review Pretalk

---

### Instructions générales pour l'agent

Tu es en charge de la refonte complète de la page Lead Review de l'application Pretalk. Cette page gère le cycle de vie d'un prospect depuis le briefing jusqu'au closing. Tu dois produire du code React/TypeScript, des fichiers SQL exécutables directement dans Supabase, et des configs n8n si nécessaire. Pour chaque tâche, génère d'abord le SQL associé avant le code frontend. Respecte strictement la charte graphique existante : vert #16a34a, blanc #ffffff, gris #f4f4f5, noir #111111, bordures 0.5px.

---

## BLOC 1 — Base de données (Supabase SQL)

### Tâche 1.1 — Colonne `pipeline_state` dans la table `leads`

Génère et exécute ce SQL :

```sql
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS pipeline_state JSONB DEFAULT '{
  "current_phase": "briefing",
  "phases": {
    "briefing":   { "status": "completed", "completed_at": null },
    "notes":      { "status": "locked" },
    "audit":      { "status": "locked" },
    "proposals":  { "status": "locked" },
    "contract":   { "status": "locked" },
    "kickoff":    { "status": "locked" },
    "finance":    { "status": "locked" }
  }
}'::jsonb;

COMMENT ON COLUMN leads.pipeline_state IS
'Source de vérité unique pour l état du pipeline. Statuts possibles : locked | pending | in_progress | completed | failed';
```

Règle : le frontend ne déduit plus jamais l'état depuis `ai_analysis_json` ou `proposals_json`. Il lit uniquement `pipeline_state`.

---

### Tâche 1.2 — Créer la table `workflow_executions`

```sql
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN (
    'briefing','notes','audit','proposals','contract','kickoff','finance'
  )),
  workflow_name TEXT NOT NULL,
  webhook_identifier TEXT,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN (
    'started','in_progress','completed','failed'
  )),
  step_label TEXT,
  progress_steps JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_executions_lead_id ON workflow_executions(lead_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead executions"
  ON workflow_executions FOR SELECT
  USING (
    lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid())
  );

COMMENT ON COLUMN workflow_executions.progress_steps IS
'Array JSON des étapes internes ex: [{"label":"Rendu PDF","status":"completed"},{"label":"Upload","status":"in_progress"}]';
```

---

### Tâche 1.3 — Créer la table `lead_generation_states`

Cette table stocke l'état de génération en temps réel pour chaque phase, écoutée via Supabase Realtime côté frontend.

```sql
CREATE TABLE IF NOT EXISTS lead_generation_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  is_generating BOOLEAN DEFAULT FALSE,
  generation_started_at TIMESTAMPTZ,
  generation_completed_at TIMESTAMPTZ,
  last_generated_at TIMESTAMPTZ,
  generation_status TEXT DEFAULT 'idle' CHECK (generation_status IN (
    'idle','generating','success','failed'
  )),
  execution_id UUID REFERENCES workflow_executions(id),
  UNIQUE(lead_id, phase)
);

ALTER TABLE lead_generation_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own generation states"
  ON lead_generation_states FOR ALL
  USING (
    lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid())
  );
```

---

### Tâche 1.4 — Préparer la Phase F Finance

```sql
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'pending'
  CHECK (billing_status IN ('pending','invoiced','paid','overdue')),
ADD COLUMN IF NOT EXISTS invoice_url TEXT,
ADD COLUMN IF NOT EXISTS invoice_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invoice_paid_at TIMESTAMPTZ;

COMMENT ON COLUMN leads.billing_status IS
'Statut de facturation Phase F. pending → invoiced → paid';
```

---

### Tâche 1.5 — Fonction utilitaire pour mettre à jour `pipeline_state`

```sql
CREATE OR REPLACE FUNCTION update_lead_phase_status(
  p_lead_id UUID,
  p_phase TEXT,
  p_status TEXT,
  p_set_current BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  UPDATE leads
  SET pipeline_state = jsonb_set(
    jsonb_set(
      pipeline_state,
      ARRAY['phases', p_phase, 'status'],
      to_jsonb(p_status)
    ),
    ARRAY['phases', p_phase,
      CASE WHEN p_status = 'completed' THEN 'completed_at'
           WHEN p_status = 'in_progress' THEN 'started_at'
           ELSE 'updated_at' END
    ],
    to_jsonb(NOW()::TEXT)
  )
  WHERE id = p_lead_id;

  IF p_set_current THEN
    UPDATE leads
    SET pipeline_state = jsonb_set(
      pipeline_state,
      '{current_phase}',
      to_jsonb(p_phase)
    )
    WHERE id = p_lead_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## BLOC 2 — Configuration centrale des phases

### Tâche 2.1 — Créer `src/config/phaseConfig.ts`

Ce fichier est la source de vérité unique pour toute la logique des phases, boutons et transitions. Le frontend ne doit contenir aucune logique de phase en dehors de ce fichier.

```typescript
export type PhaseStatus = 
  'locked' | 'pending' | 'in_progress' | 'completed' | 'failed';

export type ButtonState = 
  'idle' | 'loading' | 'success' | 'failed' | 'regenerate';

export interface PhaseButton {
  id: string;
  label: string;
  regenLabel?: string;
  loadingLabel: string;
  successLabel: string;
  style: 'outline' | 'primary' | 'dark';
  webhookAction: string;
  isDestructive?: boolean;
  requiresConfirm?: boolean;
}

export interface PhaseConfig {
  id: string;
  label: string;
  subtitle: string;
  sidebarHint: (lead: any) => string;
  unlockedWhen: (lead: any) => boolean;
  buttons: PhaseButton[];
  progressSteps: string[];
  estimatedDuration: string;
}

export const PHASE_CONFIG: Record<string, PhaseConfig> = {
  briefing: {
    id: 'briefing',
    label: 'Briefing',
    subtitle: 'Vue d\'ensemble du lead',
    sidebarHint: (lead) => `${lead.response_count}/13 réponses`,
    unlockedWhen: () => true,
    buttons: [
      {
        id: 'analyse',
        label: 'Analyser Brief',
        regenLabel: 'Ré-analyser',
        loadingLabel: 'Analyse en cours…',
        successLabel: 'Analyse terminée ✓',
        style: 'outline',
        webhookAction: 'triggerAnalysis',
      },
      {
        id: 'generate_audit',
        label: 'Générer Audit',
        regenLabel: 'Ré-générer Audit',
        loadingLabel: 'Génération en cours…',
        successLabel: 'Audit généré ✓',
        style: 'primary',
        webhookAction: 'triggerAuditGeneration',
      },
    ],
    progressSteps: [
      'Lecture des réponses du formulaire',
      'Calcul des scores de maturité',
      'Génération des questions clés',
      'Synchronisation',
    ],
    estimatedDuration: '5 à 15 secondes',
  },

  audit: {
    id: 'audit',
    label: 'Audit',
    subtitle: 'Contenu généré',
    sidebarHint: (lead) => lead.final_report_pdf ? 'PDF prêt' : 'Généré & sync',
    unlockedWhen: (lead) => !!lead.ai_analysis_json,
    buttons: [
      {
        id: 'save',
        label: 'Enregistrer',
        loadingLabel: 'Enregistrement…',
        successLabel: 'Enregistré ✓',
        style: 'outline',
        webhookAction: 'saveAudit',
      },
      {
        id: 'generate_pdf',
        label: 'Générer PDF',
        regenLabel: 'Ré-générer PDF',
        loadingLabel: 'Création du PDF…',
        successLabel: 'PDF prêt ✓',
        style: 'outline',
        webhookAction: 'triggerPdfGeneration',
      },
      {
        id: 'send',
        label: 'Envoyer',
        regenLabel: 'Renvoyer',
        loadingLabel: 'Envoi en cours…',
        successLabel: 'Envoyé ✓',
        style: 'dark',
        webhookAction: 'sendAuditEmail',
      },
    ],
    progressSteps: [
      'Récupération du contenu de l\'audit',
      'Rendu du template HTML → PDF',
      'Optimisation et compression',
      'Upload vers le stockage',
    ],
    estimatedDuration: '8 à 20 secondes',
  },

  proposals: {
    id: 'proposals',
    label: 'Offres',
    subtitle: 'Constructeur tarifaire',
    sidebarHint: (lead) => {
      const count = lead.proposals_json?.length ?? 0;
      return count === 0 ? 'Aucune option' : `${count}/3 options créées`;
    },
    unlockedWhen: (lead) => !!lead.final_report_pdf,
    buttons: [
      {
        id: 'save',
        label: 'Enregistrer',
        loadingLabel: 'Enregistrement…',
        successLabel: 'Enregistré ✓',
        style: 'outline',
        webhookAction: 'saveProposals',
      },
      {
        id: 'ia_boost',
        label: 'IA Booster',
        regenLabel: 'Re-booster IA',
        loadingLabel: 'IA génère les offres…',
        successLabel: 'Offres générées ✓',
        style: 'outline',
        webhookAction: 'triggerProposalGen',
      },
      {
        id: 'send',
        label: 'Envoyer les offres',
        regenLabel: 'Renvoyer les offres',
        loadingLabel: 'Envoi en cours…',
        successLabel: 'Offres envoyées ✓',
        style: 'primary',
        webhookAction: 'sendProposals',
      },
    ],
    progressSteps: [
      'Analyse du contexte audit',
      'Génération option A',
      'Génération option B',
      'Génération option C',
    ],
    estimatedDuration: '10 à 25 secondes',
  },

  contract: {
    id: 'contract',
    label: 'Contrat',
    subtitle: 'Clauses & signature',
    sidebarHint: (lead) => lead.deals?.[0]?.billing_status === 'paid'
      ? 'Payé' : 'En attente de paiement',
    unlockedWhen: (lead) => !!lead.proposals_json?.length,
    buttons: [
      {
        id: 'save',
        label: 'Enregistrer',
        loadingLabel: 'Enregistrement…',
        successLabel: 'Enregistré ✓',
        style: 'outline',
        webhookAction: 'saveContract',
      },
      {
        id: 'generate_pdf',
        label: 'Générer PDF',
        regenLabel: 'Ré-générer PDF',
        loadingLabel: 'Création du PDF…',
        successLabel: 'PDF prêt ✓',
        style: 'outline',
        webhookAction: 'triggerContractPdf',
      },
      {
        id: 'send_signature',
        label: 'Envoyer signature',
        regenLabel: 'Renvoyer signature',
        loadingLabel: 'Envoi en cours…',
        successLabel: 'Envoyé pour signature ✓',
        style: 'outline',
        webhookAction: 'sendForSignature',
      },
      {
        id: 'validate',
        label: 'Valider',
        loadingLabel: 'Validation…',
        successLabel: 'Contrat validé ✓',
        style: 'primary',
        webhookAction: 'triggerDealWon',
        requiresConfirm: true,
      },
    ],
    progressSteps: [
      'Récupération des offres validées',
      'Rédaction des clauses IA',
      'Génération du document final',
      'Mise à disposition pour signature',
    ],
    estimatedDuration: '5 à 12 secondes',
  },

  kickoff: {
    id: 'kickoff',
    label: 'Kickoff',
    subtitle: 'Onboarding client',
    sidebarHint: () => 'En attente',
    unlockedWhen: (lead) => lead.pipeline_state?.phases?.contract?.status === 'completed',
    buttons: [
      {
        id: 'preview',
        label: 'Aperçu formulaire',
        loadingLabel: 'Chargement…',
        successLabel: 'Aperçu prêt ✓',
        style: 'outline',
        webhookAction: 'previewKickoffForm',
      },
      {
        id: 'generate_form',
        label: 'Générer formulaire',
        regenLabel: 'Ré-générer formulaire',
        loadingLabel: 'Génération des champs…',
        successLabel: 'Formulaire généré ✓',
        style: 'primary',
        webhookAction: 'generateKickoff',
      },
    ],
    progressSteps: [
      'Analyse des données client',
      'Génération des champs personnalisés',
      'Construction du formulaire',
      'Activation du lien public',
    ],
    estimatedDuration: '6 à 15 secondes',
  },

  finance: {
    id: 'finance',
    label: 'Finance',
    subtitle: 'Facturation & reçus',
    sidebarHint: (lead) => lead.billing_status ?? 'En attente',
    unlockedWhen: (lead) => lead.pipeline_state?.phases?.kickoff?.status === 'completed',
    buttons: [],
    progressSteps: [],
    estimatedDuration: 'N/A',
  },
};
```

---

## BLOC 3 — Hook React de gestion des états de bouton

### Tâche 3.1 — Créer `src/hooks/usePhaseButton.ts`

```typescript
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type ButtonState = 'idle' | 'loading' | 'success' | 'failed' | 'regenerate';

interface UsePhaseButtonOptions {
  leadId: string;
  phase: string;
  buttonId: string;
  webhookAction: string;
  hasBeenGenerated: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function usePhaseButton({
  leadId, phase, buttonId, webhookAction,
  hasBeenGenerated, onSuccess, onError,
}: UsePhaseButtonOptions) {
  const [state, setState] = useState<ButtonState>(
    hasBeenGenerated ? 'regenerate' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const trigger = useCallback(async () => {
    if (state === 'loading') return;

    setState('loading');
    setErrorMessage('');

    const executionId = crypto.randomUUID();

    await supabase.from('lead_generation_states').upsert({
      lead_id: leadId,
      phase,
      is_generating: true,
      generation_started_at: new Date().toISOString(),
      generation_status: 'generating',
      execution_id: executionId,
    }, { onConflict: 'lead_id,phase' });

    try {
      const { error } = await supabase.functions.invoke('trigger-workflow', {
        body: { leadId, phase, action: webhookAction, executionId },
      });

      if (error) throw new Error(error.message);

      setState('success');
      retryCount.current = 0;

      await supabase.from('lead_generation_states').upsert({
        lead_id: leadId, phase,
        is_generating: false,
        generation_completed_at: new Date().toISOString(),
        last_generated_at: new Date().toISOString(),
        generation_status: 'success',
      }, { onConflict: 'lead_id,phase' });

      onSuccess?.();

      setTimeout(() => setState('regenerate'), 2500);

    } catch (err: any) {
      retryCount.current += 1;

      await supabase.from('lead_generation_states').upsert({
        lead_id: leadId, phase,
        is_generating: false,
        generation_status: 'failed',
      }, { onConflict: 'lead_id,phase' });

      if (retryCount.current >= MAX_RETRIES) {
        setState('failed');
        setErrorMessage('3 tentatives échouées. Contactez le support.');
        onError?.('max_retries_reached');
      } else {
        setState('failed');
        setErrorMessage(err.message ?? 'Erreur inconnue');
        onError?.(err.message);
      }
    }
  }, [state, leadId, phase, webhookAction]);

  return { state, trigger, errorMessage, retryCount: retryCount.current };
}
```

---

## BLOC 4 — Composant bouton contextuel avec tous les états visuels

### Tâche 4.1 — Créer `src/components/PhaseActionButton.tsx`

```typescript
import React from 'react';
import { usePhaseButton } from '@/hooks/usePhaseButton';
import type { PhaseButton } from '@/config/phaseConfig';

interface Props {
  config: PhaseButton;
  leadId: string;
  phase: string;
  hasBeenGenerated: boolean;
  onSuccess?: () => void;
}

export function PhaseActionButton({ config, leadId, phase, hasBeenGenerated, onSuccess }: Props) {
  const { state, trigger, errorMessage } = usePhaseButton({
    leadId, phase,
    buttonId: config.id,
    webhookAction: config.webhookAction,
    hasBeenGenerated,
    onSuccess,
  });

  const getLabel = () => {
    switch (state) {
      case 'loading':   return config.loadingLabel;
      case 'success':   return config.successLabel;
      case 'failed':    return errorMessage.includes('max_retries')
                          ? 'Contacter le support' : 'Échec — Réessayer';
      case 'regenerate': return config.regenLabel ?? config.label;
      default:           return config.label;
    }
  };

  const getStyle = () => {
    if (state === 'success') return 'btn-success';
    if (state === 'failed')  return 'btn-error';
    return `btn-${config.style}`;
  };

  const handleClick = () => {
    if (config.requiresConfirm && state !== 'loading') {
      if (!window.confirm(`Confirmer : ${config.label} ?`)) return;
    }
    trigger();
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      title={state === 'failed' ? errorMessage : undefined}
      className={`phase-btn ${getStyle()} ${state}`}
      style={{ minWidth: '140px' }}
    >
      {state === 'loading' && <span className="spinner" />}
      {state === 'success' && <span className="check-icon">✓</span>}
      {state === 'failed'  && <span className="warn-icon">!</span>}
      {(state === 'regenerate' && config.regenLabel) && <span className="regen-icon">↺</span>}
      {getLabel()}
    </button>
  );
}
```

---

## BLOC 5 — Indicateurs de progression en temps réel

### Tâche 5.1 — Créer `src/components/GenerationBanner.tsx`

Ce composant écoute `workflow_executions` via Supabase Realtime et affiche la progression en temps réel.

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProgressStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Props {
  leadId: string;
  phase: string;
  estimatedDuration: string;
}

export function GenerationBanner({ leadId, phase, estimatedDuration }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [currentLabel, setCurrentLabel] = useState('');

  useEffect(() => {
    const channel = supabase
      .channel(`gen-${leadId}-${phase}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lead_generation_states',
        filter: `lead_id=eq.${leadId}`,
      }, (payload: any) => {
        const row = payload.new;
        if (row.phase !== phase) return;

        if (row.is_generating) {
          setIsVisible(true);
          setCurrentLabel(row.step_label ?? 'Traitement en cours…');
        } else {
          setTimeout(() => setIsVisible(false), 800);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workflow_executions',
        filter: `lead_id=eq.${leadId}`,
      }, (payload: any) => {
        const row = payload.new;
        if (row.phase !== phase) return;
        if (row.progress_steps) setSteps(row.progress_steps);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [leadId, phase]);

  if (!isVisible) return null;

  return (
    <div className="generation-banner">
      <div className="banner-header">
        <span className="banner-spinner" />
        <span className="banner-label">{currentLabel}</span>
        <span className="banner-duration">{estimatedDuration}</span>
      </div>

      {steps.length > 0 && (
        <div className="banner-steps">
          {steps.map((step, i) => (
            <div key={i} className={`banner-step ${step.status}`}>
              {step.status === 'completed'  && <span className="step-check">✓</span>}
              {step.status === 'in_progress' && <span className="step-spin" />}
              {step.status === 'pending'    && <span className="step-dot" />}
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="banner-progress-bar">
        <div className="banner-progress-shimmer" />
      </div>
    </div>
  );
}
```

---

## BLOC 6 — Edge Function Supabase (API layer)

### Tâche 6.1 — Créer `supabase/functions/trigger-workflow/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const N8N_BASE = 'https://backand.pretalk.me/webhook';

const WEBHOOK_MAP: Record<string, string> = {
  triggerAnalysis:     `${N8N_BASE}/7a84dac7-...`,
  triggerAuditGeneration: `${N8N_BASE}/generate-audit`,
  triggerPdfGeneration:   `${N8N_BASE}/generate-audit`,
  triggerProposalGen:     `${N8N_BASE}/phase-c-generate-proposal`,
  triggerDealWon:         `${N8N_BASE}/deal-won-ops`,
  generateKickoff:        `${N8N_BASE}/generate-form-fields`,
  saveAudit:              null,
  saveProposals:          null,
  saveContract:           null,
};

serve(async (req) => {
  const { leadId, phase, action, executionId } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabase.from('workflow_executions').insert({
    id: executionId, lead_id: leadId, phase,
    workflow_name: action, status: 'started',
    webhook_identifier: WEBHOOK_MAP[action] ?? 'direct_save',
  });

  const webhookUrl = WEBHOOK_MAP[action];

  if (!webhookUrl) {
    return new Response(JSON.stringify({ ok: true, type: 'direct_save' }));
  }

  let lastError = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, phase, executionId }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await supabase.from('workflow_executions').update({
        status: 'completed', completed_at: new Date().toISOString(),
      }).eq('id', executionId);

      await supabase.rpc('update_lead_phase_status', {
        p_lead_id: leadId, p_phase: phase,
        p_status: 'in_progress', p_set_current: true,
      });

      return new Response(JSON.stringify({ ok: true, executionId }));

    } catch (e: any) {
      lastError = e.message;
      await supabase.from('workflow_executions').update({
        retry_count: attempt + 1,
        error_message: lastError,
      }).eq('id', executionId);

      if (attempt < 2) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }

  await supabase.from('workflow_executions').update({
    status: 'failed', error_message: lastError,
    completed_at: new Date().toISOString(),
  }).eq('id', executionId);

  return new Response(JSON.stringify({ ok: false, error: lastError }), { status: 500 });
});
```

---

## Ordre d'exécution pour l'agent

| Ordre | Tâche | Type | Fichier |
|-------|-------|------|---------|
| 1 | SQL pipeline_state | SQL Supabase | À exécuter en premier |
| 2 | SQL workflow_executions | SQL Supabase | À exécuter en deuxième |
| 3 | SQL lead_generation_states | SQL Supabase | À exécuter en troisième |
| 4 | SQL finance columns | SQL Supabase | À exécuter en quatrième |
| 5 | SQL fonction update_lead_phase_status | SQL Supabase | À exécuter en cinquième |
| 6 | phaseConfig.ts | TypeScript | Config centrale |
| 7 | usePhaseButton.ts | Hook React | Logique boutons |
| 8 | PhaseActionButton.tsx | Composant React | UI bouton |
| 9 | GenerationBanner.tsx | Composant React | Progression temps réel |
| 10 | trigger-workflow/index.ts | Edge Function | API layer n8n |
| 11 | Intégration dans LeadReview.tsx | Refactoring | Connecter tout ensemble |

**Règle absolue pour l'agent** : exécute les 5 SQL en premier et confirme leur succès avant d'écrire une seule ligne de code frontend. Si une migration SQL échoue, arrête-toi et reporte l'erreur avant de continuer.