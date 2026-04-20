import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { loadEnv } from './env';
import { sessionManager } from './session.manager';
import { toQrPayload } from './qr.handler';
import { publishInbound } from './message.handler';
import { consumeOutbound } from './outbound.consumer';

loadEnv();

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.WS_CORS_ORIGIN || '*', credentials: true },
});

const port = Number(process.env.PORT || 5000);
const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

app.post('/session/connect', async (req, res) => {
  const { tenantId } = req.body;
  if (!tenantId) return res.status(400).json({ error: 'tenantId is required' });

  await sessionManager.createSession(
    tenantId,
    (qr) => {
      const payload = toQrPayload(qr);
      io.to(`tenant:${tenantId}`).emit('wa.qr_updated', { tenantId, qrBase64: payload.qrBase64 });
    },
    (status) => {
      io.to(`tenant:${tenantId}`).emit('wa.status_changed', { tenantId, status });
    },
    async (inbound) => {
      await publishInbound(rabbitmqUrl, inbound);
    },
  );

  return res.json({ success: true });
});

app.get('/session/status/:tenantId', (req, res) => {
  const status = sessionManager.getStatus(req.params.tenantId);
  res.json({ status });
});

app.get('/session/qr/:tenantId', (req, res) => {
  const qr = sessionManager.getQR(req.params.tenantId);
  if (!qr) return res.status(404).json({ error: 'No QR available' });
  return res.json({ qrBase64: Buffer.from(qr).toString('base64') });
});

app.post('/session/disconnect', async (req, res) => {
  const { tenantId } = req.body;
  await sessionManager.disconnect(tenantId);
  res.json({ success: true });
});

io.on('connection', (socket) => {
  const tenantId = (socket.handshake.query?.tenantId as string) || '';
  if (tenantId) socket.join(`tenant:${tenantId}`);
});

consumeOutbound(rabbitmqUrl).catch((e) => console.error('consumeOutbound fatal error', e));

server.listen(port, () => {
  console.log(`wa-sessions listening on ${port}`);
});
