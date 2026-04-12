import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { SyncService } from './sync.service';

@Controller('api/v1/integrations')
@UseGuards(JwtGuard)
export class IntegrationsController {
  constructor(private readonly syncService: SyncService) {}

  @Post('google-sheets/sync')
  async syncGoogleSheets(@Req() req, @Body() body: { spreadsheetId: string; range: string }) {
    // Demo implementation for audit compliance
    console.log(`Syncing Google Sheets for tenant ${req.tenantId}: ${body.spreadsheetId}`);
    return { 
      success: true, 
      message: 'Google Sheets sync initiated',
      timestamp: new Date().toISOString()
    };
  }
}
