export const SOCKET_EVENTS = {
  MESSAGE_NEW: 'message.new',
  CONVERSATION_UPDATED: 'conversation.updated',
  AI_THINKING: 'ai.thinking',
  HIT_TRIGGERED: 'hitl.triggered',
  NOTIFICATION: 'notification',
  JOIN_INBOX: 'join_inbox',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
