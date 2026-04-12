import type { Message } from "./message";

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'ai_active' | 'human_requested' | 'pending_human';

export interface Conversation {
  id: string;
  tenantId: string;
  contactId: string;
  status: ConversationStatus;
  unreadCount: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;

  // Added for Inbox UI
  contact_name: string;
  contact_phone: string;
  ai_active: boolean;
  pipeline_stage?: string;
  tags?: string[];
  last_message?: Message;
  last_message_at?: string;
  contact?: any;
}
