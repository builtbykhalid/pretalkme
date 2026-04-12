/**
 * usePhaseButton — Hook React pour gérer les 5 états d'un bouton d'action
 * États : idle → loading → success → regenerate (ou failed)
 *
 * Ce hook gère :
 * - Le lifecycle complet du bouton (transition automatique success → regenerate)
 * - La persistence dans lead_generation_states pour tracking temps réel
 * - L'appel direct aux webhooks n8n (pas d'edge function)
 * - Le compteur de retry (max 3)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  N8N_CERVEAU_WEBHOOK,
    N8N_GENERATE_AUDIT_WEBHOOK,
  N8N_REGENERATE_AUDIT_WEBHOOK,
    N8N_GENERATE_PROPOSAL_WEBHOOK,
    N8N_GENERATE_DEVIS_WEBHOOK,
    N8N_DEAL_WON_OPS_WEBHOOK,
    N8N_GENERATE_FORMS_WEBHOOK,
} from '../lib/n8n';

const BACKEND_ONLY_EMAIL_ACTIONS = new Set([
  'sendSelectedOffers',
  'sendAllOffers',
  'sendForSignature',
  'sendAuditEmail',
  'sendProposals',
]);

export type ButtonState = 'idle' | 'loading' | 'success' | 'failed' | 'regenerate';

interface UsePhaseButtonOptions {
  leadId: string;
  phase: string;
  buttonId: string;
  webhookAction: string;
  hasBeenGenerated: boolean;
  /** Custom action handler — if provided, will be called instead of webhook */
  customHandler?: () => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Map webhookAction to n8n webhook URLs
const getWebhookURL = (action: string): string | null => {
  const webhookMap: Record<string, string> = {
    'triggerAuditGeneration': N8N_CERVEAU_WEBHOOK,
    'triggerPdfGeneration': N8N_GENERATE_AUDIT_WEBHOOK,
    'regenerateAudit': N8N_REGENERATE_AUDIT_WEBHOOK,
    'triggerProposalGen': N8N_GENERATE_PROPOSAL_WEBHOOK,
    'generateDevisPdf': N8N_GENERATE_DEVIS_WEBHOOK,
    'triggerContractGeneration': N8N_DEAL_WON_OPS_WEBHOOK,
    'triggerDealWon': N8N_DEAL_WON_OPS_WEBHOOK,
    'generateKickoff': N8N_GENERATE_FORMS_WEBHOOK,
  };
  return webhookMap[action] || null;
};

export function usePhaseButton({
  leadId, phase, buttonId, webhookAction,
  hasBeenGenerated, customHandler, onSuccess, onError,
}: UsePhaseButtonOptions) {
  const isSaveAction = buttonId === 'save';
  const [state, setState] = useState<ButtonState>(
    !isSaveAction && hasBeenGenerated ? 'regenerate' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync initial state when hasBeenGenerated changes
  useEffect(() => {
    if (!isSaveAction && state === 'idle' && hasBeenGenerated) {
      setState('regenerate');
    }
  }, [hasBeenGenerated, isSaveAction, state]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const trigger = useCallback(async () => {
    if (state === 'loading') return;

    setState('loading');
    setErrorMessage('');

    const executionId = crypto.randomUUID();
    const shouldTrackGenerationState = !customHandler && !isSaveAction;

    if (shouldTrackGenerationState) {
      // Write generation state for real-time tracking
      try {
        await supabase.from('lead_generation_states').upsert({
          lead_id: leadId,
          phase,
          is_generating: true,
          generation_started_at: new Date().toISOString(),
          generation_status: 'generating',
          execution_id: executionId,
        }, { onConflict: 'lead_id,phase' });
      } catch (e) {
        // Non-blocking — tracking failure shouldn't break the UX
        console.warn('[usePhaseButton] Failed to write generation state:', e);
      }
    }

    try {
      if (customHandler) {
        // For actions like "save" that don't need n8n
        await customHandler();
      } else {
        if (BACKEND_ONLY_EMAIL_ACTIONS.has(webhookAction)) {
          throw new Error(
            `Action ${webhookAction} must use backend email API. Configure a customHandler for this button.`
          );
        }

        // Call n8n webhook directly
        const webhookURL = getWebhookURL(webhookAction);
        if (!webhookURL) {
          throw new Error(`No webhook URL configured for action: ${webhookAction}`);
        }

        // ✓ FIX #5: Add 30s timeout to prevent UI freeze on hanging webhooks
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lead_id: leadId }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`N8N error: ${response.statusText}`);
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error('Action timeout (30s). Webhook did not respond in time. Please try again or contact support.');
          }
          throw fetchError;
        }
      }

      setState('success');
      retryCount.current = 0;

      // Update generation state
      if (shouldTrackGenerationState) {
        try {
          await supabase.from('lead_generation_states').upsert({
            lead_id: leadId,
            phase,
            is_generating: false,
            generation_completed_at: new Date().toISOString(),
            last_generated_at: new Date().toISOString(),
            generation_status: 'success',
          }, { onConflict: 'lead_id,phase' });
        } catch (e) {
          console.warn('[usePhaseButton] Failed to update generation state:', e);
        }
      }

      onSuccess?.();

      // For save actions, return to idle; generation actions go to regenerate.
      successTimerRef.current = setTimeout(() => setState(isSaveAction ? 'idle' : 'regenerate'), 2500);

    } catch (err: any) {
      retryCount.current += 1;

      // Update generation state as failed
      if (shouldTrackGenerationState) {
        try {
          await supabase.from('lead_generation_states').upsert({
            lead_id: leadId, phase,
            is_generating: false,
            generation_status: 'failed',
          }, { onConflict: 'lead_id,phase' });
        } catch (e) {
          console.warn('[usePhaseButton] Failed to update failed state:', e);
        }
      }

      const errMsg = err.message ?? 'Erreur inconnue';

      if (retryCount.current >= MAX_RETRIES) {
        // ✓ FIX #15: Add actionable support contact pathway on final failure
        setState('failed');
        const supportEmail = 'support@pretalk.me';
        const supportMsg = `${MAX_RETRIES} tentatives échouées. `
          + `📧 <a href="mailto:${supportEmail}?subject=Lead%20Generation%20Failed%20(${phase})&body=${encodeURIComponent(errMsg)}" `
          + `style="color: #0066cc; text-decoration: underline;" target="_blank">Contactez le support</a>`;
        setErrorMessage(supportMsg);
        onError?.('max_retries_reached');
      } else {
        setState('failed');
        setErrorMessage(errMsg);
        onError?.(errMsg);
      }
    }
  }, [state, leadId, phase, webhookAction, customHandler, onSuccess, onError]);

  return { state, setState, trigger, errorMessage, retryCount: retryCount.current };
}
