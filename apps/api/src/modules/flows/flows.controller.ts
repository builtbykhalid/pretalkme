import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { FlowsService } from './flows.service';

@Controller('flows')
@UseGuards(JwtGuard)
export class FlowsController {
  constructor(private readonly flowsService: FlowsService) {}

  @Get()
  findAll(@Req() req) {
    return this.flowsService.findAll(req.tenantId);
  }

  @Post()
  save(@Req() req, @Body() body: any) {
    return this.flowsService.save(req.tenantId, body);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.flowsService.delete(req.tenantId, id);
  }
}
