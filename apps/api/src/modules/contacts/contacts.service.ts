import { Injectable } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@Injectable()
export class ContactsService {
  async findAll(tenantId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(tenantId: string, id: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*, orders(*)')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async update(tenantId: string, id: string, updateData: any) {
    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(tenantId: string, id: string) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
}
