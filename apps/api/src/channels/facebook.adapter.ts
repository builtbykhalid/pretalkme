import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChannelAdapter, ChannelCredentials, NormalizedMessage } from './types';

@Injectable()
export class FacebookAdapter implements ChannelAdapter {
  channel: 'facebook' = 'facebook';

  normalizeInbound(rawWebhook: any): NormalizedMessage[] {
    const messages: NormalizedMessage[] = [];
    for (const entry of rawWebhook.entry || []) {
      for (const messaging of entry.messaging || []) {
        if (!messaging.message) continue;
        messages.push({
          externalId: messaging.message.mid,
          channel: 'facebook',
          from: messaging.sender.id,
          type: messaging.message.attachments ? 'image' : 'text',
          text: messaging.message.text,
          mediaUrl: messaging.message.attachments?.[0]?.payload?.url,
          timestamp: messaging.timestamp,
          raw: messaging,
        });
      }
    }
    return messages;
  }

  async sendText(recipientId: string, text: string, credentials: ChannelCredentials): Promise<string> {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text },
        messaging_type: 'RESPONSE',
      },
      { params: { access_token: credentials.pageAccessToken } },
    );
    return response.data.message_id;
  }

  async sendMedia(): Promise<string> {
    return 'media-not-supported-yet';
  }
}
