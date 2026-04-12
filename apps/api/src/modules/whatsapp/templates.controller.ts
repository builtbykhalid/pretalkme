import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { WhatsappTemplatesService } from './templates.service';

@Controller('templates')
@UseGuards(JwtGuard)
export class TemplatesController {
  constructor(private readonly templatesService: WhatsappTemplatesService) {}

  @Get()
  getTemplates(@Req() req) {
    return this.templatesService.getTemplates(req.tenantId);
  }

  @Post()
  createTemplate(@Req() req, @Body() data: any) {
    return this.templatesService.createTemplate(req.tenantId, data);
  }

  @Delete(':id')
  deleteTemplate(@Req() req, @Param('id') id: string) {
    return this.templatesService.deleteTemplate(req.tenantId, id);
  }
}
