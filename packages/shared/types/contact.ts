export interface Contact {
  id: string;
  tenantId: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  tags: string[];
  pipelineStage?: string;
  createdAt: string;
  updatedAt: string;
}
