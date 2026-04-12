import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { supabase } from '../../infrastructure/supabase/supabase.client';

export const PLAN_METRIC_KEY = 'plan_metric';
export const PlanMetric = (metric: string) => SetMetadata(PLAN_METRIC_KEY, metric);

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metric = this.reflector.get<string>(PLAN_METRIC_KEY, context.getHandler());
    if (!metric) return true;

    const request = context.switchToHttp().getRequest();
    const { tenantId } = request;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID missing for plan check');
    }

    // Call the check_plan_limit RPC in Supabase (defined in Agent 08)
    const { data, error } = await supabase.rpc('check_plan_limit', {
      p_tenant_id: tenantId,
      p_metric: metric
    });

    if (error) {
      console.error('PlanGuard RPC Error:', error);
      return true; // Fail safe or fail loud? Let's allow for now but log.
    }

    if (!data?.allowed) {
      throw new ForbiddenException({
        error: 'PLAN_LIMIT_EXCEEDED',
        message: `Vous avez atteint votre limite de ${data?.limit} ${metric} ce mois-ci.`,
        metric,
        limit: data?.limit,
        used: data?.used,
      });
    }

    return true;
  }
}
