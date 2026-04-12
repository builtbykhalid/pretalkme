import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@Injectable()
export class FlowsService {
  async findAll(tenantId: string) {
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data;
  }

  async save(tenantId: string, flowData: any) {
    const { data, error } = await supabase
      .from('flows')
      .upsert({ ...flowData, tenant_id: tenantId }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(tenantId: string, id: string) {
    await supabase.from('flows').delete().eq('tenant_id', tenantId).eq('id', id);
    return { success: true };
  }

  async executeFlow(tenantId: string, flowId: string, context: any) {
    // Logic to parse the nodes_json and edges_json
    // and execute actions (send message, wait, etc)
    console.log(`Executing flow ${flowId} for tenant ${tenantId}`);
  }
}
