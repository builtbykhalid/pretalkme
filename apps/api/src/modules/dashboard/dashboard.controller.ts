import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Req() req) {
    return this.dashboardService.getStats(req.tenantId);
  }

  @Get('whatsapp-account')
  getWhatsappAccount(@Req() req) {
    return this.dashboardService.getWhatsappAccount(req.tenantId);
  }
}
