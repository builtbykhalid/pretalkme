import amqplib from 'amqplib';
import { sessionManager } from './session.manager';

export async function consumeOutbound(rabbitmqUrl: string) {
  let retryDelay = 2000;

  for (;;) {
    try {
      const conn = await amqplib.connect(rabbitmqUrl);
      const ch = await conn.createChannel();
      await ch.assertQueue('whatsapp.outbound', { durable: true });

      console.log('wa-sessions outbound consumer connected');
      retryDelay = 2000;

      conn.on('error', (error) => {
        console.error('wa-sessions outbound connection error', error);
      });

      conn.on('close', () => {
        console.warn('wa-sessions outbound connection closed; reconnect scheduled');
      });

      await new Promise<void>((resolve) => {
        ch.consume('whatsapp.outbound', async (msg) => {
          if (!msg) return;

          const payload = JSON.parse(msg.content.toString());

          try {
            const status = sessionManager.getStatus(payload.tenant_id);
            if (status !== 'connected') {
              ch.ack(msg);
              return;
            }

            const socket = sessionManager.getSocket(payload.tenant_id);
            if (socket && payload.to && payload.text_response) {
              await socket.sendMessage(`${payload.to}@s.whatsapp.net`, { text: payload.text_response });
            }
          } catch (error) {
            console.error('wa-sessions outbound message error', error);
          }

          ch.ack(msg);
        });

        conn.once('close', () => resolve());
      });
    } catch (error) {
      console.error(`wa-sessions outbound unavailable; retry in ${retryDelay}ms`, error);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  }
}
