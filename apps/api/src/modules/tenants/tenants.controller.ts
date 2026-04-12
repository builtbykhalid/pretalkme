import { Controller, Get, Patch, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { TenantsService } from './tenants.service';

@Controller('settings')
@UseGuards(JwtGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  getSettings(@Req() req) {
    return this.tenantsService.getSettings(req.tenantId);
  }

  @Patch()
  updateSettings(@Req() req, @Body() body: any) {
    return this.tenantsService.updateSettings(req.tenantId, body);
  }

  @Get('team')
  getTeam(@Req() req) {
    return this.tenantsService.getTeam(req.tenantId);
  }

  @Post('team/invite')
  invite(@Req() req, @Body() body: { email: string; role: string }) {
    return this.tenantsService.inviteMember(req.tenantId, body.email, body.role);
  }
}
