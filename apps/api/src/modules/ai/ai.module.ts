import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { RabbitmqModule } from '../../infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
