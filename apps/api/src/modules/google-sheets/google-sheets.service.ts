import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { google } from 'googleapis';
import { supabase } from '../../infrastructure/supabase/supabase.client';
import { GoogleOAuthService } from './google-oauth.service';

@Injectable()
export class GoogleSheetsService {
  constructor(private readonly googleOAuth: GoogleOAuthService) {}

  async syncOrderToSheet(tenantId: string, orderId: string) {
    const { data: integration } = await supabase
      .from('google_sheets_integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .single();

    if (!integration || !integration.spreadsheet_id) return;

    const { data: order } = await supabase
      .from('orders')
      .select('*, contacts(name, phone)')
      .eq('id', orderId)
      .single();

    if (!order) return;

    const auth = await this.googleOAuth.getAuthorizedClient(tenantId);
    const sheets = google.sheets({ version: 'v4', auth });

    const rowData = [
      order.external_id,
      order.contacts?.name || '',
      order.contacts?.phone || '',
      order.status,
      order.total,
      JSON.stringify(order.items_json || []),
      new Date(order.created_at).toLocaleString('fr-FR'),
    ];

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: integration.spreadsheet_id,
        range: `${integration.sheet_tab_name || 'Commandes'}!A:G`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });

      await this.logSync(tenantId, 'google_sheets', 'order_created', orderId, 'success');
    } catch (error: any) {
      await this.logSync(
        tenantId,
        'google_sheets',
        'order_created',
        orderId,
        'failed',
        error?.message || 'Unknown error',
      );
    }
  }

  @Cron('*/15 * * * *')
  async retrySyncLogs() {
    const { data: failedLogs } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('status', 'failed')
      .eq('integration', 'google_sheets')
      .lt('retries', 3)
      .order('created_at', { ascending: true })
      .limit(50);

    for (const log of failedLogs || []) {
      await this.syncOrderToSheet(log.tenant_id, log.entity_id);
      await supabase
        .from('sync_logs')
        .update({ retries: (log.retries || 0) + 1, retried_at: new Date().toISOString() })
        .eq('id', log.id);
    }
  }

  async getConfig(tenantId: string) {
    const { data, error } = await supabase
      .from('google_sheets_integrations')
      .select('spreadsheet_id, spreadsheet_name, sheet_tab_name, column_mapping, active, last_sync_at')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async saveConfig(tenantId: string, body: any) {
    const { data, error } = await supabase
      .from('google_sheets_integrations')
      .upsert({
        tenant_id: tenantId,
        spreadsheet_id: body.spreadsheet_id,
        spreadsheet_name: body.spreadsheet_name || null,
        sheet_tab_name: body.sheet_tab_name || 'Commandes',
        column_mapping: body.column_mapping || null,
        active: body.active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async testWrite(tenantId: string) {
    const fakeOrderId = '00000000-0000-0000-0000-000000000000';
    await this.logSync(tenantId, 'google_sheets', 'sync_full', fakeOrderId, 'pending');
    return { success: true, message: 'Test queued' };
  }

  async getSyncLogs(tenantId: string) {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('integration', 'google_sheets')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return data;
  }

  async retryByLog(tenantId: string, logId: string) {
    const { data: log, error } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', logId)
      .single();

    if (error || !log) throw error || new Error('Log not found');
    await this.syncOrderToSheet(log.tenant_id, log.entity_id);
    return { success: true };
  }

  private async logSync(
    tenantId: string,
    integration: 'google_sheets' | 'youcan' | 'shopify' | 'woocommerce',
    eventType: string,
    entityId: string,
    status: 'success' | 'failed' | 'pending',
    errorMessage?: string,
  ) {
    await supabase.from('sync_logs').insert({
      tenant_id: tenantId,
      integration: integration,
      event_type: eventType,
      entity_id: entityId,
      status,
      error_message: errorMessage || null,
    });
  }
}
