export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'audio' | 'image' | 'video' | 'document' | 'template';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  direction: MessageDirection;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  isAiGenerated: boolean;
  aiConfidence?: number;
  wamid?: string;
  status: MessageStatus;
  createdAt: string;
}
