import { Module } from '@nestjs/common';
import { WhatsAppAdapter } from '../../channels/whatsapp.adapter';
import { FacebookAdapter } from '../../channels/facebook.adapter';
import { InstagramAdapter } from '../../channels/instagram.adapter';
import { ChannelController } from './channel.controller';
import { MessageRouter } from './message-router.service';

@Module({
  controllers: [ChannelController],
  providers: [WhatsAppAdapter, FacebookAdapter, InstagramAdapter, MessageRouter],
})
export class ChannelsModule {}
