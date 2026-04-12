/**
 * GenerationBanner — Indicateur de progression en temps réel
 * Écoute workflow_executions et lead_generation_states via Supabase Realtime
 * Affiche un bandeau slide-down avec les étapes internes de la génération.
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, Check, Loader2 } from 'lucide-react';

interface ProgressStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Props {
  leadId: string;
  phase: string;
  estimatedDuration: string;
  defaultSteps?: string[];
}

export function GenerationBanner({ leadId, phase, estimatedDuration, defaultSteps = [] }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
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
          setIsAnimatingOut(false);
          setCurrentLabel(row.step_label ?? 'Traitement en cours…');

          // Init default steps if no real-time steps from workflow_executions
          if (defaultSteps.length > 0 && steps.length === 0) {
            setSteps(defaultSteps.map((label, i) => ({
              label,
              status: i === 0 ? 'in_progress' : 'pending',
            })));
          }
        } else {
          // Animate out
          setIsAnimatingOut(true);
          setTimeout(() => {
            setIsVisible(false);
            setIsAnimatingOut(false);
            setSteps([]);
          }, 800);
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

        // Update progress steps from workflow_executions
        if (row.progress_steps && Array.isArray(row.progress_steps)) {
          setSteps(row.progress_steps);
        }

        // Update current label
        if (row.step_label) {
          setCurrentLabel(row.step_label);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, phase, defaultSteps.length]);

  if (!isVisible) return null;

  return (
    <div className={`generation-banner ${isAnimatingOut ? 'banner-exit' : 'banner-enter'}`}>
      <div className="banner-header">
        <div className="banner-icon-wrapper">
          <Sparkles size={14} className="banner-ai-icon" />
        </div>
        <div className="banner-text">
          <span className="banner-label">{currentLabel}</span>
          <span className="banner-duration">Estimé : {estimatedDuration}</span>
        </div>
      </div>

      {steps.length > 0 && (
        <div className="banner-steps">
          {steps.map((step, i) => (
            <div key={i} className={`banner-step banner-step-${step.status}`}>
              {step.status === 'completed' && (
                <Check size={12} className="step-icon step-check" />
              )}
              {step.status === 'in_progress' && (
                <Loader2 size={12} className="step-icon step-spin" />
              )}
              {step.status === 'pending' && (
                <span className="step-icon step-dot" />
              )}
              <span className="step-label">{step.label}</span>
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
