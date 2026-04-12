export interface AiRun {
  id: string;
  tenantId: string;
  conversationId: string;
  messageId: string;
  inputText: string;
  outputText: string;
  sttResult?: any;
  ttsUrl?: string;
  confidenceScore: number;
  hitlTriggered: boolean;
  createdAt: string;
}
