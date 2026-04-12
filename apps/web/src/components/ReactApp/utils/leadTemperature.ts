/**
 * Lead Scoring & Temperature Detection Utilities
 * Provides visual indicators for lead qualification levels
 */

export interface LeadTemperature {
  level: 'cold' | 'warm' | 'hot';
  emoji: string;
  label: string;
  labelFr: string;
  color: string;
  bgColor: string;
  recommendation: string;
  recommendationFr: string;
  urgency: 'low' | 'medium' | 'high';
}

export const getLeadTemperature = (score: number): LeadTemperature => {
  if (score >= 80) {
    return {
      level: 'hot',
      emoji: '🔥',
      label: 'Hot Lead',
      labelFr: 'Lead Chaud',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      recommendation: 'Call immediately — High closing probability',
      recommendationFr: 'Appelez immédiatement — Probabilité de fermeture très élevée',
      urgency: 'high',
    };
  } else if (score >= 50) {
    return {
      level: 'warm',
      emoji: '⭐',
      label: 'Warm Lead',
      labelFr: 'Lead Chaud',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      recommendation: 'High priority — Prepare your pitch',
      recommendationFr: 'Priorité haute — Préparez votre pitch',
      urgency: 'medium',
    };
  } else {
    return {
      level: 'cold',
      emoji: '❄️',
      label: 'Cold Lead',
      labelFr: 'À Qualifier',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      recommendation: 'Needs qualification — Review form responses',
      recommendationFr: 'Besoin de qualification — Analysez les réponses',
      urgency: 'low',
    };
  }
};

/**
 * Score indicators for status badges
 */
export const getScoreIndicator = (score: number): string => {
  if (score >= 85) return '⭐⭐⭐⭐⭐';
  if (score >= 70) return '⭐⭐⭐⭐';
  if (score >= 50) return '⭐⭐⭐';
  if (score >= 30) return '⭐⭐';
  return '⭐';
};

/**
 * Recommendation for next action based on score
 */
export const getNextActionRecommendation = (
  score: number,
  lang: 'en' | 'fr' = 'fr'
): string => {
  const recommendations = {
    en: {
      hot: 'Call or schedule meeting immediately',
      warm: 'Follow up within 24 hours with customized pitch',
      cold: 'Send additional qualifying questions or educational content',
    },
    fr: {
      hot: 'Appelez ou programmez un appel immédiatement',
      warm: 'Relancer dans les 24h avec un pitch personnalisé',
      cold: 'Envoyez des questions de qualification ou contenu éducatif',
    },
  };

  const temp = getLeadTemperature(score);
  return recommendations[lang][temp.level];
};

/**
 * Format score for display
 */
export const formatScore = (score: number): string => {
  return `${Math.round(score)}/100`;
};

/**
 * Determine if action should be encouraged based on score
 */
export const shouldEncourageAction = (score: number, actionType: 'call' | 'demo' | 'email'): boolean => {
  if (actionType === 'call') return score >= 50;
  if (actionType === 'demo') return score >= 40;
  if (actionType === 'email') return score >= 0; // Always valid
  return false;
};

/**
 * Get score context for AI-generated content
 */
export const getScoreContext = (score: number, lang: 'en' | 'fr' = 'fr'): string => {
  const temp = getLeadTemperature(score);
  const context = {
    en: {
      hot: `This prospect is highly qualified (${score}/100). They show strong buying signals. Emphasize ROI and quick wins in your proposal.`,
      warm: `This prospect is moderately qualified (${score}/100). They have potential but may have concerns. Address objections proactively.`,
      cold: `This prospect needs more qualification (${score}/100). Focus on understanding their needs and building trust first.`,
    },
    fr: {
      hot: `Ce prospect est très qualifié (${score}/100). Il montre de forts signaux d'achat. Mettez en avant le ROI dans votre proposition.`,
      warm: `Ce prospect est modérément qualifié (${score}/100). Il a du potentiel mais peut avoir des préoccupations. Adressez les objections proactivement.`,
      cold: `Ce prospect a besoin de plus de qualification (${score}/100). Concentrez-vous d'abord sur la compréhension de ses besoins.`,
    },
  };

  return context[lang][temp.level];
};
