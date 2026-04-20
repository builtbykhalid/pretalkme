import { Module } from '@nestjs/common';
import { GoogleSheetsController } from './google-sheets.controller';
import { GoogleSheetsService } from './google-sheets.service';
import { GoogleOAuthService } from './google-oauth.service';

@Module({
  controllers: [GoogleSheetsController],
  providers: [GoogleSheetsService, GoogleOAuthService],
  exports: [GoogleSheetsService, GoogleOAuthService],
})
export class GoogleSheetsModule {}
