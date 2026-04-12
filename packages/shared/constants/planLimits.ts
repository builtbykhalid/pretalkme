export const PLAN_LIMITS = {
  trial: {
    label: 'Essai Gratuit',
    duration_days: 14,
    wa_numbers: 1,
    conversations_month: 100,
    ai_credits_month: 50,
    team_members: 1,
    broadcasts_month: 0,
    features: {
      voice_ai: false,
      flow_builder: false,
      multi_whatsapp: false,
      ecommerce_sync: true,
      kanban_crm: true,
      hitl: true,
      white_label: false,
    }
  },
  solo: {
    label: 'Agent Solo',
    price_mad_monthly: 690,
    price_mad_annual: 590,
    wa_numbers: 1,
    conversations_month: 300,
    ai_credits_month: 200,
    team_members: 1,
    broadcasts_month: 2,
    features: {
      voice_ai: true,
      flow_builder: false,
      multi_whatsapp: false,
      ecommerce_sync: true,
      kanban_crm: true,
      hitl: true,
      white_label: false,
    }
  },
  pro: {
    label: 'Machine de Vente',
    price_mad_monthly: 1490,
    price_mad_annual: 1270,
    wa_numbers: 3,
    conversations_month: 1000,
    ai_credits_month: 1000,
    team_members: 5,
    broadcasts_month: 10,
    features: {
      voice_ai: true,
      flow_builder: true,
      multi_whatsapp: true,
      ecommerce_sync: true,
      kanban_crm: true,
      hitl: true,
      white_label: false,
    }
  },
  agence: {
    label: 'Directeur Commercial',
    price_mad_monthly: 3490,
    price_mad_annual: 2970,
    wa_numbers: 5,
    conversations_month: 5000,
    ai_credits_month: -1,         // -1 = illimité
    team_members: -1,
    broadcasts_month: -1,
    features: {
      voice_ai: true,
      flow_builder: true,
      multi_whatsapp: true,
      ecommerce_sync: true,
      kanban_crm: true,
      hitl: true,
      white_label: true,
      dedicated_account_manager: true,
    }
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
