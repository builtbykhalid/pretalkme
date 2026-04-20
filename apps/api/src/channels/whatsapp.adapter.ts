import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChannelAdapter, ChannelCredentials, NormalizedMessage } from './types';

@Injectable()
export class WhatsAppAdapter implements ChannelAdapter {
  channel: 'whatsapp' = 'whatsapp';

  normalizeInbound(rawWebhook: any): NormalizedMessage[] {
    const messages: NormalizedMessage[] = [];
    for (const entry of rawWebhook.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        for (const msg of change.value?.messages || []) {
          messages.push({
            externalId: msg.id,
            channel: 'whatsapp',
            from: msg.from,
            type: msg.type,
            text: msg.text?.body,
            mediaUrl: undefined,
            timestamp: parseInt(msg.timestamp || '0', 10) * 1000,
            raw: msg,
          });
        }
      }
    }
    return messages;
  }

  async sendText(recipientId: string, text: string, credentials: ChannelCredentials): Promise<string> {
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${credentials.phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipientId,
        type: 'text',
        text: { body: text },
      },
      { headers: { Authorization: `Bearer ${credentials.metaToken}` } },
    );
    return response.data.messages?.[0]?.id || '';
  }

  async sendMedia(): Promise<string> {
    return 'media-not-supported-yet';
  }
}
