import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WaConnectService {
  private baseUrl = process.env.WA_SESSIONS_URL || 'http://localhost:5000';

  async connect(tenantId: string) {
    const { data } = await axios.post(`${this.baseUrl}/session/connect`, { tenantId });
    return data;
  }

  async status(tenantId: string) {
    const { data } = await axios.get(`${this.baseUrl}/session/status/${tenantId}`);
    return data;
  }

  async disconnect(tenantId: string) {
    const { data } = await axios.post(`${this.baseUrl}/session/disconnect`, { tenantId });
    return data;
  }

  async qr(tenantId: string) {
    const { data } = await axios.get(`${this.baseUrl}/session/qr/${tenantId}`);
    return data;
  }
}
