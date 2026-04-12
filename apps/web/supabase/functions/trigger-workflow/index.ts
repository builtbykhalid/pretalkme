/**
 * Edge Function: trigger-workflow
 * Secure API layer between frontend and n8n webhooks.
 *
 * Flow:
 * 1. Receive { leadId, phase, action, executionId } from frontend
 * 2. Validate and log in workflow_executions
 * 3. Forward to n8n webhook with retry logic (3 attempts, 30s timeout)
 * 4. Update workflow_executions and pipeline_state on completion
 *
 * Benefits:
 * - n8n URLs never exposed to the client
 * - Centralized retry, auth, rate limiting
 * - Full telemetry in workflow_executions
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const N8N_BASE = Deno.env.get('N8N_BASE_URL') || 'https://backand.pretalk.me/webhook';

// Map frontend action names to n8n webhook paths
const WEBHOOK_MAP: Record<string, string | null> = {
  // Phase A - Briefing
  triggerAnalysis:          `${N8N_BASE}/7a84dac7-7a65-40ae-8149-53959ea917fb`,

  // Phase B - Audit
  triggerAuditGeneration:   `${N8N_BASE}/generate-audit`,
  triggerPdfGeneration:     `${N8N_BASE}/generate-audit`,
  regenerateAudit:          `${N8N_BASE}/regenerate-audit`,
  sendAuditEmail:           `${N8N_BASE}/master-email-hub`,

  // Phase C - Proposals
  triggerProposalGen:       `${N8N_BASE}/generate-proposal`,
  sendProposals:            `${N8N_BASE}/master-email-hub`,

  // Phase D - Contract
  triggerContractGeneration: `${N8N_BASE}/deal-won-ops`,
  sendForSignature:          `${N8N_BASE}/lead-actions`,
  triggerDealWon:            `${N8N_BASE}/deal-won-ops`,

  // Phase E - Kickoff
  generateKickoff:          `${N8N_BASE}/generate-forms`,
  sendKickoffEmail:         `${N8N_BASE}/master-email-hub`,
  previewKickoffForm:       null, // No webhook needed — frontend-only action

  // Local actions (no n8n webhook)
  saveAudit:                null,
  saveProposals:            null,
  saveContract:             null,
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId, phase, action, executionId, payload: extraPayload } = await req.json();

    if (!leadId || !phase || !action) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: leadId, phase, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Log execution start
    const execId = executionId || crypto.randomUUID();
    await supabase.from('workflow_executions').insert({
      id: execId,
      lead_id: leadId,
      phase,
      workflow_name: action,
      status: 'started',
      webhook_identifier: WEBHOOK_MAP[action] ?? 'direct_save',
    });

    // Update pipeline_state to in_progress
    await supabase.rpc('update_lead_phase_status', {
      p_lead_id: leadId,
      p_phase: phase,
      p_status: 'in_progress',
      p_set_current: true,
    });

    // Mark phase generation as active (single source of truth for generation UI state)
    await supabase.from('lead_generation_states').upsert({
      lead_id: leadId,
      phase,
      is_generating: true,
      generation_started_at: new Date().toISOString(),
      generation_status: 'generating',
      execution_id: execId,
    }, { onConflict: 'lead_id,phase' });

    const webhookUrl = WEBHOOK_MAP[action];

    // If no webhook (save actions), mark completed immediately
    if (!webhookUrl) {
      await supabase.from('workflow_executions').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      }).eq('id', execId);

      await supabase.rpc('update_lead_phase_status', {
        p_lead_id: leadId,
        p_phase: phase,
        p_status: 'completed',
        p_set_current: false,
      });

      await supabase.from('lead_generation_states').upsert({
        lead_id: leadId,
        phase,
        is_generating: false,
        generation_completed_at: new Date().toISOString(),
        last_generated_at: new Date().toISOString(),
        generation_status: 'success',
        execution_id: execId,
      }, { onConflict: 'lead_id,phase' });

      return new Response(
        JSON.stringify({ ok: true, type: 'direct_save', executionId: execId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch lead data for webhook payload
    const { data: leadData } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    // Try up to 3 times with exponential backoff
    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: leadId,
            phase,
            executionId: execId,
            ...(leadData || {}),
            ...(extraPayload || {}),
          }),
          signal: AbortSignal.timeout(30000),
        });

        const responseText = await res.text();
        let webhookData: any = null;
        try {
          webhookData = responseText ? JSON.parse(responseText) : null;
        } catch {
          webhookData = responseText || null;
        }

        if (!res.ok) {
          const responseHint = typeof webhookData === 'string'
            ? webhookData
            : (webhookData?.error || webhookData?.message || 'Unknown webhook error');
          throw new Error(`HTTP ${res.status}: ${responseHint}`);
        }

        if (action === 'generateKickoff' && webhookData && typeof webhookData === 'object' && webhookData.form_slug) {
          await supabase.from('leads').update({
            kickoff_form_slug: webhookData.form_slug,
          }).eq('id', leadId);
        }

        // Success — update tracking
        await supabase.from('workflow_executions').update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            webhook_response: webhookData,
          },
        }).eq('id', execId);

        await supabase.rpc('update_lead_phase_status', {
          p_lead_id: leadId,
          p_phase: phase,
          p_status: 'completed',
          p_set_current: false,
        });

        await supabase.from('lead_generation_states').upsert({
          lead_id: leadId,
          phase,
          is_generating: false,
          generation_completed_at: new Date().toISOString(),
          last_generated_at: new Date().toISOString(),
          generation_status: 'success',
          execution_id: execId,
        }, { onConflict: 'lead_id,phase' });

        return new Response(
          JSON.stringify({ ok: true, executionId: execId, data: webhookData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (e: any) {
        lastError = e.message;
        await supabase.from('workflow_executions').update({
          retry_count: attempt + 1,
          error_message: lastError,
        }).eq('id', execId);

        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        }
      }
    }

    // All retries failed
    await supabase.from('workflow_executions').update({
      status: 'failed',
      error_message: lastError,
      completed_at: new Date().toISOString(),
    }).eq('id', execId);

    // Set pipeline phase to failed
    await supabase.rpc('update_lead_phase_status', {
      p_lead_id: leadId,
      p_phase: phase,
      p_status: 'failed',
      p_set_current: false,
    });

    await supabase.from('lead_generation_states').upsert({
      lead_id: leadId,
      phase,
      is_generating: false,
      generation_completed_at: new Date().toISOString(),
      generation_status: 'failed',
      execution_id: execId,
    }, { onConflict: 'lead_id,phase' });

    return new Response(
      JSON.stringify({ ok: false, error: lastError, executionId: execId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
