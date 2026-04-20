export type Channel = 'whatsapp' | 'facebook' | 'instagram';

export interface ChannelCredentials {
  pageAccessToken?: string;
  metaToken?: string;
  phoneId?: string;
}

export interface NormalizedMessage {
  externalId: string;
  channel: Channel;
  from: string;
  fromName?: string;
  type: 'text' | 'audio' | 'image' | 'video' | 'document' | 'sticker';
  text?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  timestamp: number;
  raw: unknown;
}

export interface ChannelAdapter {
  channel: Channel;
  normalizeInbound(rawWebhook: any): NormalizedMessage[];
  sendText(recipientId: string, text: string, credentials: ChannelCredentials): Promise<string>;
  sendMedia(recipientId: string, mediaUrl: string, type: string, credentials: ChannelCredentials): Promise<string>;
}
