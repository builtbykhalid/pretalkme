/**
 * PhaseActionButton — Composant bouton contextuel universel
 * Gère les 5 états visuels : idle, loading (spinner), success (✓), regenerate (↺), failed (!)
 * 
 * Utilisé dans le header contextuel de chaque phase du Lead Review.
 */

import React from 'react';
import { usePhaseButton } from '../hooks/usePhaseButton';
import type { PhaseButton } from '../lib/phaseConfig';
import { Loader2, Check, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  config: PhaseButton;
  leadId: string;
  phase: string;
  hasBeenGenerated: boolean;
  /** Custom handler for non-webhook actions like "save" */
  customHandler?: () => Promise<void>;
  onSuccess?: () => void;
}

export function PhaseActionButton({
  config, leadId, phase, hasBeenGenerated, customHandler, onSuccess,
}: Props) {
  const { state, trigger, errorMessage } = usePhaseButton({
    leadId, phase,
    buttonId: config.id,
    webhookAction: config.webhookAction,
    hasBeenGenerated,
    customHandler,
    onSuccess,
  });

  const getLabel = () => {
    switch (state) {
      case 'loading':    return config.loadingLabel;
      case 'success':    return config.successLabel;
      case 'failed':     return errorMessage.includes('3 tentatives')
                           ? 'Contacter le support' : 'Échec — Réessayer';
      case 'regenerate': return config.regenLabel ?? config.label;
      default:           return config.label;
    }
  };

  const getClassName = () => {
    const base = 'phase-action-btn';
    const styleMap: Record<string, string> = {
      outline: 'phase-btn-outline',
      primary: 'phase-btn-primary',
      dark: 'phase-btn-dark',
    };
    
    const stateClass: Record<string, string> = {
      success: 'phase-btn-success',
      failed: 'phase-btn-error',
      loading: 'phase-btn-loading',
      regenerate: 'phase-btn-regen',
    };

    return [
      base,
      stateClass[state] ?? styleMap[config.style] ?? 'phase-btn-outline',
    ].join(' ');
  };

  const handleClick = () => {
    if (state === 'loading') return;
    if (config.requiresConfirm && state !== 'failed') {
      if (!window.confirm(`Confirmer : ${config.label} ?`)) return;
    }
    trigger();
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      title={state === 'failed' ? errorMessage : undefined}
      className={getClassName()}
      style={{ minWidth: '140px', minHeight: '44px' }}
    >
      {state === 'loading' && (
        <Loader2 size={13} className="phase-btn-spinner" />
      )}
      {state === 'success' && (
        <Check size={13} className="phase-btn-check" />
      )}
      {state === 'failed' && (
        <AlertTriangle size={13} className="phase-btn-warn" />
      )}
      {state === 'regenerate' && config.regenLabel && (
        <RefreshCw size={12} className="phase-btn-regen-icon" />
      )}
      <span>{getLabel()}</span>
    </button>
  );
}
