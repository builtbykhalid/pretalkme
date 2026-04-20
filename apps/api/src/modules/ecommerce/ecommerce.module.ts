import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { YoucanClient } from './youcan.client';
import { IntegrationsController } from './integrations.controller';
import { LightFunnelClient } from './lightfunnel.client';
import { OrderConfirmationService } from './order-confirmation.service';
import { OrderConfirmationsController } from './order-confirmations.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { LightfunnelWebhookController } from './lightfunnel-webhook.controller';

@Module({
  imports: [WhatsappModule],
  controllers: [IntegrationsController, OrderConfirmationsController, LightfunnelWebhookController],
  providers: [SyncService, YoucanClient, LightFunnelClient, OrderConfirmationService],
  exports: [SyncService, OrderConfirmationService],
})
export class EcommerceModule {}
