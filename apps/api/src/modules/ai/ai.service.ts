import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { RabbitmqService } from '../../infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class AiService {
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  async getConfig(tenantId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('ai_enabled, ai_voice_enabled, ai_voice_id, ai_language, ai_hitl_threshold, ai_system_prompt, ai_hitl_keywords')
      .eq('id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateConfig(tenantId: string, config: any) {
    const { data, error } = await supabase
      .from('tenants')
      .update(config)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getLogs(tenantId: string) {
    const { data, error } = await supabase
      .from('ai_runs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  async simulate(tenantId: string, message: string) {
     // Trigger a test task to RabbitMQ for specific simulation queue or just use main
     // For now, return a placeholder
     return { response: "Ceci est une simulation de réponse IA basée sur votre config." };
  }
}
