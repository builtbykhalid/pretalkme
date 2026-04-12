export interface Tenant {
  id: string;
  name: string;
  wabaId?: string;
  wabaAccessToken?: string;
  phoneNumberId?: string;
  plan: string;
  aiConfig: any; // To be refined
  createdAt: string;
}
