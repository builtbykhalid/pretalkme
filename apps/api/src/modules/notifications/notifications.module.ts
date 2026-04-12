import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConversationsModule } from '../conversations/conversations.module';

@Global()
@Module({
  imports: [ConversationsModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
