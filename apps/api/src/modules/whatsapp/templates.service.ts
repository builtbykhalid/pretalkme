import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappTemplatesService {
  constructor(private configService: ConfigService) {}

  async getTemplates(tenantId: string) {
    // 1. Fetch WABA ID and Token for the tenant from DB
    // (In reality, you'd fetch specific credentials for each tenant)
    const wabaId = 'MOCKED_WABA_ID'; 
    const token = this.configService.get('META_ACCESS_TOKEN');

    if (!token) {
       // Mocked data for dev if no token
       return [
         { id: '1', name: 'welcome_message', status: 'APPROVED', category: 'MARKETING', body: 'Bonjour {{1}}, bienvenue chez {{2}} !' },
         { id: '2', name: 'order_update', status: 'PENDING', category: 'UTILITY', body: 'Votre commande #{{1}} est en cours de livraison.' },
         { id: '3', name: 'appointment_reminder', status: 'REJECTED', category: 'UTILITY', body: 'Rappel de votre RDV demain à {{1}}.' },
       ];
    }

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${wabaId}/message_templates`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (err) {
      console.error('Meta API Error:', err.response?.data || err.message);
      throw err;
    }
  }

  async createTemplate(tenantId: string, data: any) {
    // Logic to sync with Meta Graph API
    return { success: true, id: 'NEW_TEMPLATE_ID' };
  }

  async deleteTemplate(tenantId: string, templateId: string) {
    return { success: true };
  }
}
