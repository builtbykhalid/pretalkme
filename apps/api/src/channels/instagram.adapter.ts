import { Injectable } from '@nestjs/common';
import { ChannelAdapter, ChannelCredentials, NormalizedMessage } from './types';

@Injectable()
export class InstagramAdapter implements ChannelAdapter {
  channel: 'instagram' = 'instagram';

  normalizeInbound(rawWebhook: any): NormalizedMessage[] {
    const messages: NormalizedMessage[] = [];
    for (const entry of rawWebhook.entry || []) {
      for (const messaging of entry.messaging || []) {
        if (!messaging.message) continue;
        messages.push({
          externalId: messaging.message.mid,
          channel: 'instagram',
          from: messaging.sender.id,
          type: 'text',
          text: messaging.message.text,
          timestamp: messaging.timestamp,
          raw: messaging,
        });
      }
    }
    return messages;
  }

  async sendText(_recipientId: string, _text: string, _credentials: ChannelCredentials): Promise<string> {
    return 'instagram-message-queued';
  }

  async sendMedia(): Promise<string> {
    return 'instagram-media-queued';
  }
}
