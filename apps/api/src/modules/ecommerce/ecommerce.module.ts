import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { YoucanClient } from './youcan.client';
import { IntegrationsController } from './integrations.controller';

@Module({
  controllers: [IntegrationsController],
  providers: [SyncService, YoucanClient],
  exports: [SyncService],
})
export class EcommerceModule {}
