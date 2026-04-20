import makeWASocket, {
  BaileysEventMap,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from './env';

export type SessionStatus = 'disconnected' | 'scanning' | 'connected' | 'expired' | 'error';

interface TenantSession {
  socket: WASocket | null;
  status: SessionStatus;
  qr?: string;
  connectedAt?: Date;
}

loadEnv();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

class SessionManager {
  private sessions: Map<string, TenantSession> = new Map();

  async createSession(
    tenantId: string,
    onQR: (qr: string) => void,
    onStatus: (s: SessionStatus) => void,
    onInbound: (payload: any) => Promise<void>,
  ) {
    const basePath = process.env.SESSION_PATH || '/tmp/wa-sessions';
    const { state, saveCreds } = await useMultiFileAuthState(`${basePath}/${tenantId}`);

    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    this.sessions.set(tenantId, { socket, status: 'disconnected' });

    socket.ev.on(
      'connection.update',
      async (update: BaileysEventMap['connection.update']) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        onQR(qr);
        onStatus('scanning');
        this.sessions.set(tenantId, { ...this.sessions.get(tenantId)!, status: 'scanning', qr });
        await supabase.from('wa_sessions').upsert({ tenant_id: tenantId, status: 'scanning' });
      }

      if (connection === 'open') {
        onStatus('connected');
        this.sessions.set(tenantId, {
          ...this.sessions.get(tenantId)!,
          status: 'connected',
          connectedAt: new Date(),
        });

        await supabase.from('wa_sessions').upsert({
          tenant_id: tenantId,
          status: 'connected',
          connected_at: new Date().toISOString(),
        });
      }

      if (connection === 'close') {
        const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = code !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          await this.createSession(tenantId, onQR, onStatus, onInbound);
        } else {
          onStatus('expired');
          this.sessions.set(tenantId, { ...this.sessions.get(tenantId)!, status: 'expired' });
          await supabase.from('wa_sessions').upsert({ tenant_id: tenantId, status: 'expired' });
        }
      }
      },
    );

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on(
      'messages.upsert',
      async ({ messages }: BaileysEventMap['messages.upsert']) => {
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;
        await onInbound({
          tenantId,
          from: msg.key.remoteJid?.replace('@s.whatsapp.net', ''),
          message: msg,
        });
      }
      },
    );
  }

  getStatus(tenantId: string): SessionStatus {
    return this.sessions.get(tenantId)?.status ?? 'disconnected';
  }

  getQR(tenantId: string): string | undefined {
    return this.sessions.get(tenantId)?.qr;
  }

  getSocket(tenantId: string): WASocket | null {
    return this.sessions.get(tenantId)?.socket || null;
  }

  async disconnect(tenantId: string) {
    const session = this.sessions.get(tenantId);
    if (session?.socket) {
      await session.socket.logout();
      this.sessions.delete(tenantId);
      await supabase.from('wa_sessions').upsert({ tenant_id: tenantId, status: 'disconnected' });
    }
  }
}

export const sessionManager = new SessionManager();
