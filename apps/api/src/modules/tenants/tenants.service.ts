import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@Injectable()
export class TenantsService {
  async getSettings(tenantId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSettings(tenantId: string, settings: any) {
    const { data, error } = await supabase
      .from('tenants')
      .update(settings)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTeam(tenantId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data;
  }

  async rotateApiKey(tenantId: string) {
    const newKey = `ptk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const { data, error } = await supabase
      .from('tenants')
      .update({ api_key: newKey })
      .eq('id', tenantId)
      .select('api_key')
      .single();

    if (error) throw error;
    return data;
  }

  async updateWebhook(tenantId: string, url: string) {
    const { data, error } = await supabase
      .from('tenants')
      .update({ webhook_url: url })
      .eq('id', tenantId)
      .select('webhook_url')
      .single();

    if (error) throw error;
    return data;
  }

  async inviteMember(tenantId: string, email: string, role: string) {
    // Demo implementation
    return { success: true, email };
  }
}
