import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { CampaignWorker } from './campaign.worker';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [WhatsappModule, ConversationsModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignWorker],
})
export class CampaignsModule {}
