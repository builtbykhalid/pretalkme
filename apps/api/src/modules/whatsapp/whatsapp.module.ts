import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { RabbitmqService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { ConversationsModule } from '../conversations/conversations.module';

import { WhatsappTemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';

@Module({
  imports: [ConversationsModule],
  controllers: [WhatsappController, TemplatesController],
  providers: [WhatsappService, WhatsappTemplatesService, RabbitmqService],
  exports: [WhatsappService, WhatsappTemplatesService],
})
export class WhatsappModule {}
