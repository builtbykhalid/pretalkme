import { PLAN_LIMITS } from '../constants/planLimits';

export type PlanName = keyof typeof PLAN_LIMITS;

export interface Plan {
  name: PlanName;
  label: string;
  price_mad_monthly?: number;
  // ... (extend as needed)
}
