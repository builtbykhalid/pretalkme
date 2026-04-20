export interface AITask {
  tenant_id: string;
  conversation_id: string;
  message_id: string;
  text_message: string | null;
  audio_url: string | null;
  image_url: string | null;
  image_mime_type: string | null;
  pdf_url: string | null;
  pdf_filename: string | null;
}
