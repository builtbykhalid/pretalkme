import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ContractsService } from './contracts.service';

@Controller('api/v1/contracts')
@UseGuards(JwtGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll(@Req() req, @Query('source') source?: string) {
    return this.contractsService.findAll(req.tenantId, source);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.contractsService.findOne(req.tenantId, id);
  }

  @Post()
  create(@Req() req, @Body() body: any) {
    return this.contractsService.create(req.tenantId, req.userId, body);
  }

  @Patch(':id/status')
  updateStatus(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.contractsService.updateStatus(req.tenantId, id, body);
  }

  @Post(':id/generate-pdf')
  generatePdf(@Req() req, @Param('id') id: string) {
    return this.contractsService.generatePdf(req.tenantId, id);
  }

  @Post(':id/send-whatsapp')
  sendViaWhatsApp(@Req() req, @Param('id') id: string) {
    return this.contractsService.sendViaWhatsApp(req.tenantId, id);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.contractsService.delete(req.tenantId, id);
  }
}