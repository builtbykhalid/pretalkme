import { Module } from '@nestjs/common';
import { WaConnectController } from './wa-connect.controller';
import { WaConnectService } from './wa-connect.service';

@Module({
  controllers: [WaConnectController],
  providers: [WaConnectService],
  exports: [WaConnectService],
})
export class WaConnectModule {}
