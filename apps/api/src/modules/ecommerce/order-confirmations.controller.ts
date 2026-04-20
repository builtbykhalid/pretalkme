import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { OrderConfirmationService } from './order-confirmation.service';

@Controller('api/v1/order-confirmations')
@UseGuards(JwtGuard)
export class OrderConfirmationsController {
  constructor(private readonly service: OrderConfirmationService) {}

  @Get('templates')
  templates(@Req() req) {
    return this.service.listTemplates(req.tenantId);
  }

  @Post('templates')
  createTemplate(@Req() req, @Body() body: any) {
    return this.service.createTemplate(req.tenantId, body);
  }

  @Patch('templates/:id')
  updateTemplate(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.service.updateTemplate(req.tenantId, id, body);
  }

  @Delete('templates/:id')
  deleteTemplate(@Req() req, @Param('id') id: string) {
    return this.service.deleteTemplate(req.tenantId, id);
  }

  @Get('history')
  history(@Req() req) {
    return this.service.history(req.tenantId);
  }
}
