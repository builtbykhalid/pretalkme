import amqplib from 'amqplib';

export async function publishInbound(rabbitmqUrl: string, payload: any) {
  const conn = await amqplib.connect(rabbitmqUrl);
  const ch = await conn.createChannel();
  await ch.assertQueue('whatsapp.inbound.qr', { durable: true });
  ch.sendToQueue('whatsapp.inbound.qr', Buffer.from(JSON.stringify(payload)), { persistent: true });
  await ch.close();
  await conn.close();
}
