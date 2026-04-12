// Plan limits configuration — source of truth partagee frontend/backend
// Valeur -1 = illimite

export type PlanId = 'trial' | 'expired' | 'starter' | 'pro' | 'growth' | 'enterprise';

export interface PlanLimits {
  duration_days: number | null;
  leads_per_month: number;
  forms_published: number;
  services: number;
  agents_installed: number;
  pdf_generations_per_month: number;
  email_sends_per_month: number;
  themes: number;
  ai_generations_per_month: number;
  deals_pipeline: boolean;
  finance_kpis: boolean;
  automations: boolean;
  custom_agents: number;
  team_members: number;
  webhooks: boolean;
  api_access: boolean;
  white_label: boolean;
  booking_calendar: boolean;
  export_csv: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  trial: {
    duration_days: 14,
    leads_per_month: 30, // Aligne sur Starter pour demo de valeur
    forms_published: 1,
    services: 1,
    agents_installed: 2,
    pdf_generations_per_month: 5,
    email_sends_per_month: 10,
    themes: 1,
    ai_generations_per_month: 20,
    deals_pipeline: false,
    finance_kpis: false,
    automations: false,
    custom_agents: 0,
    team_members: 1,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: true,
    export_csv: false,
  },
  expired: {
    duration_days: null,
    leads_per_month: 0,
    forms_published: 0,
    services: 0,
    agents_installed: 0,
    pdf_generations_per_month: 0,
    email_sends_per_month: 0,
    themes: 0,
    ai_generations_per_month: 0,
    deals_pipeline: false,
    finance_kpis: false,
    automations: false,
    custom_agents: 0,
    team_members: 0,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: false,
    export_csv: false,
  },
  starter: {
    duration_days: null,
    leads_per_month: 30,
    forms_published: 3,
    services: 2,
    agents_installed: 5,
    pdf_generations_per_month: 20,
    email_sends_per_month: 100,
    themes: 2,
    ai_generations_per_month: 50,
    deals_pipeline: false,
    finance_kpis: false,
    automations: false,
    custom_agents: 0,
    team_members: 1,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: true,
    export_csv: true,
  },
  pro: {
    duration_days: null,
    leads_per_month: -1,
    forms_published: 10,
    services: 5,
    agents_installed: -1,
    pdf_generations_per_month: -1,
    email_sends_per_month: 500,
    themes: 4,
    ai_generations_per_month: 200,
    deals_pipeline: true,
    finance_kpis: true,
    automations: false,
    custom_agents: 1,
    team_members: 1,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: true,
    export_csv: true,
  },
  growth: {
    duration_days: null,
    leads_per_month: -1,
    forms_published: -1,
    services: -1,
    agents_installed: -1,
    pdf_generations_per_month: -1,
    email_sends_per_month: 2000,
    themes: -1,
    ai_generations_per_month: -1,
    deals_pipeline: true,
    finance_kpis: true,
    automations: true,
    custom_agents: 2,
    team_members: 5,
    webhooks: true,
    api_access: false,
    white_label: true,
    booking_calendar: true,
    export_csv: true,
  },
  enterprise: {
    duration_days: null,
    leads_per_month: -1,
    forms_published: -1,
    services: -1,
    agents_installed: -1,
    pdf_generations_per_month: -1,
    email_sends_per_month: -1,
    themes: -1,
    ai_generations_per_month: -1,
    deals_pipeline: true,
    finance_kpis: true,
    automations: true,
    custom_agents: -1,
    team_members: -1,
    webhooks: true,
    api_access: true,
    white_label: true,
    booking_calendar: true,
    export_csv: true,
  },
};

// Plan display info
export const PLAN_INFO: Record<PlanId, { name: string; price_monthly: number; price_annual: number; color: string }> = {
  trial: { name: 'Essai Gratuit', price_monthly: 0, price_annual: 0, color: '#6B7280' },
  expired: { name: 'Expire', price_monthly: 0, price_annual: 0, color: '#EF4444' },
  starter: { name: 'Starter', price_monthly: 19, price_annual: 15, color: '#10B981' },
  pro: { name: 'Pro', price_monthly: 29, price_annual: 23, color: '#7C3AED' },
  growth: { name: 'Growth', price_monthly: 99, price_annual: 79, color: '#F59E0B' },
  enterprise: { name: 'Enterprise', price_monthly: 0, price_annual: 0, color: '#1F2937' },
};

// Helper: check if a numeric limit allows an action
export function isWithinLimit(current: number, limit: number): boolean {
  if (limit === -1) return true; // unlimited
  return current < limit;
}

// Helper: check if a boolean feature is available
export function hasFeature(plan: PlanId, feature: keyof PlanLimits): boolean {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return false;
  const value = limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return false;
}
