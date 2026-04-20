import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@Injectable()
export class GoogleOAuthService {
  private readonly SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  private readonly oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.CORS_ORIGIN}/whatsapp/settings/integrations/google-callback`,
    );
  }

  getAuthUrl(tenantId: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      state: tenantId,
      prompt: 'consent',
    });
  }

  async exchangeCode(tenantId: string, code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);

    await supabase.from('google_sheets_integrations').upsert({
      tenant_id: tenantId,
      access_token: tokens.access_token ? this.encrypt(tokens.access_token) : null,
      refresh_token: tokens.refresh_token ? this.encrypt(tokens.refresh_token) : null,
      token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      spreadsheet_id: '',
    });

    return { success: true };
  }

  async getAuthorizedClient(tenantId: string): Promise<OAuth2Client> {
    const { data, error } = await supabase
      .from('google_sheets_integrations')
      .select('access_token, refresh_token, token_expiry')
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      throw new Error('Google Sheets integration not configured');
    }

    this.oauth2Client.setCredentials({
      access_token: data.access_token ? this.decrypt(data.access_token) : undefined,
      refresh_token: data.refresh_token ? this.decrypt(data.refresh_token) : undefined,
      expiry_date: data.token_expiry ? new Date(data.token_expiry).getTime() : undefined,
    });

    const refreshed = await this.oauth2Client.getAccessToken();
    if (refreshed.token && refreshed.token !== (data.access_token ? this.decrypt(data.access_token) : undefined)) {
      await supabase
        .from('google_sheets_integrations')
        .update({
          access_token: this.encrypt(refreshed.token),
          token_expiry: new Date(Date.now() + 3600 * 1000).toISOString(),
        })
        .eq('tenant_id', tenantId);
    }

    return this.oauth2Client;
  }

  private getKey(): Buffer {
    const raw = process.env.ENCRYPTION_KEY || 'pretalkme-default-dev-key';
    return createHash('sha256').update(raw).digest();
  }

  private encrypt(value: string): string {
    const iv = randomBytes(16);
    const key = this.getKey();
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decrypt(value: string): string {
    const [ivHex, dataHex] = value.split(':');
    const key = this.getKey();
    const decipher = createDecipheriv('aes-256-cbc', key, Buffer.from(ivHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
