import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
@UseGuards(JwtGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  findAll(@Req() req) {
    return this.campaignsService.findAll(req.tenantId);
  }

  @Post()
  create(@Req() req, @Body() body: any) {
    return this.campaignsService.create(req.tenantId, body);
  }

  @Post(':id/start')
  start(@Req() req, @Param('id') id: string) {
    return this.campaignsService.startCampaign(req.tenantId, id);
  }
}
