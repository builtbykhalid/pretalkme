import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;

  async onModuleInit() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Ensure all required queues exist (Plan 06 MODULE 4)
      const queues = [
        'whatsapp.inbound', 
        'ai.tasks', 
        'ai.results', 
        'whatsapp.outbound', 
        'dlq.rejected'
      ];
      
      for (const queue of queues) {
        await this.channel.assertQueue(queue, { durable: true });
      }

      // Start listening for AI results (Plan 06 MODULE 4)
      this.channel.consume('ai.results', async (msg) => {
        if (!msg) return;
        const result = JSON.parse(msg.content.toString());
        await this.handleAIResult(result);
        this.channel.ack(msg);
      });

      console.log('RabbitMQ: Connection established and listening for ai.results');
    } catch (error) {
      console.error('RabbitMQ Init Error:', error);
    }
  }

  async handleAIResult(result: any) {
    const { tenant_id, conversation_id, llm_response, tts_url, hitl_triggered, hitl_reason } = result;

    // 1. Save ai_run record for analytics
    await supabase.from('ai_runs').insert({
      tenant_id,
      conversation_id,
      ...result
    });

    if (hitl_triggered) {
      // 2. If HITL triggered, update conversation and notify agents
      await supabase.from('conversations').update({
        status: 'pending_human',
        ai_active: false,
      }).eq('id', conversation_id);

      await supabase.from('messages').insert({
        tenant_id,
        conversation_id,
        direction: 'outbound',
        type: 'note',
        content: `🤖 IA a passé la main — Raison : ${hitl_reason}`,
      });

      return;
    }

    // 3. If NOT triggered, publish to whatsapp.outbound for delivery
    await this.publish('whatsapp.outbound', {
      tenant_id,
      conversation_id,
      text_response: llm_response,
      audio_url: tts_url,
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish(queue: string, data: any) {
    if (!this.channel) {
      console.error('RabbitMQ: Cannot publish, channel not initialized');
      return;
    }
    const content = Buffer.from(JSON.stringify(data));
    this.channel.sendToQueue(queue, content, { persistent: true });
  }

  // Helper to consume (to be expanded in specific modules)
  async consume(queue: string, callback: (data: any) => Promise<void>) {
    await this.channel.consume(queue, async (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        await callback(data);
        this.channel.ack(msg);
      }
    });
  }
}
