import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';
import { EcommerceModule } from '../ecommerce/ecommerce.module';

@Module({
  imports: [ConversationsModule, GoogleSheetsModule, EcommerceModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
