import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
// BillingModule désactivé temporairement — Stripe non configuré pour dev
// import { BillingModule } from './modules/billing/billing.module';
import { EcommerceModule } from './modules/ecommerce/ecommerce.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FlowsModule } from './modules/flows/flows.module';
import { AiModule } from './modules/ai/ai.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { EmailModule } from './modules/email/email.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { RabbitmqModule } from './infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    RabbitmqModule,
    EmailModule,
    NotificationsModule,
    WhatsappModule,
    ConversationsModule,
    // BillingModule, // désactivé — Stripe non configuré pour dev
    EcommerceModule,
    ContactsModule,
    CampaignsModule,
    FlowsModule,
    AiModule,
    TenantsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
