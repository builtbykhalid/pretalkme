import { create } from 'zustand';
import type { Conversation, Message } from '@pretalkme/shared/types';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  typingConversations: Record<string, boolean>;
  hitlConversations: Record<string, string>; // convId → reason

  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  setMessages: (messages: Message[]) => void; // For active conversation
  addMessage: (message: Message) => void;     // For active conversation
  setActiveConversation: (id: string | null) => void;
  setTyping: (conversationId: string, typing: boolean) => void;
  markHITL: (conversationId: string, reason: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingConversations: {},
  hitlConversations: {},

  setConversations: (conversations) => set({ conversations }),
  
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  setMessages: (messages) =>
    set((state) => {
      if (!state.activeConversationId) return state;
      return {
        messages: { ...state.messages, [state.activeConversationId]: messages },
      };
    }),

  addMessage: (message) =>
    set((state) => {
      const convId = state.activeConversationId || message.conversationId;
      if (!convId) return state;
      return {
        messages: {
          ...state.messages,
          [convId]: [...(state.messages[convId] || []), message],
        },
      };
    }),

  setActiveConversation: (id) => set({ activeConversationId: id }),
  
  setTyping: (conversationId, typing) =>
    set((state) => ({
      typingConversations: { ...state.typingConversations, [conversationId]: typing },
    })),

  markHITL: (conversationId, reason) =>
    set((state) => ({
      hitlConversations: { ...state.hitlConversations, [conversationId]: reason },
    })),
}));
