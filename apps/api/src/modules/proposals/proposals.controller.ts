import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ProposalsService } from './proposals.service';

@Controller('api/v1/proposals')
@UseGuards(JwtGuard)
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  /** GET /api/v1/proposals?source=whatsapp */
  @Get()
  findAll(@Req() req, @Query('source') source?: string) {
    return this.proposalsService.findAll(req.tenantId, source);
  }

  /** GET /api/v1/proposals/:id */
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.proposalsService.findOne(req.tenantId, id);
  }

  /** POST /api/v1/proposals */
  @Post()
  create(@Req() req, @Body() body: any) {
    return this.proposalsService.create(req.tenantId, req.userId, body);
  }

  /** PATCH /api/v1/proposals/:id/status */
  @Patch(':id/status')
  updateStatus(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.proposalsService.updateStatus(req.tenantId, id, body);
  }

  /** POST /api/v1/proposals/:id/generate-pdf */
  @Post(':id/generate-pdf')
  generatePdf(@Req() req, @Param('id') id: string) {
    return this.proposalsService.generatePdf(req.tenantId, id);
  }

  /** POST /api/v1/proposals/:id/send-whatsapp */
  @Post(':id/send-whatsapp')
  sendViaWhatsApp(@Req() req, @Param('id') id: string) {
    return this.proposalsService.sendViaWhatsApp(req.tenantId, id);
  }

  /** DELETE /api/v1/proposals/:id */
  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.proposalsService.delete(req.tenantId, id);
  }
}
