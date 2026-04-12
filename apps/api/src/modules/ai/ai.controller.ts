import { Controller, Get, Patch, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('config')
  getConfig(@Req() req) {
    return this.aiService.getConfig(req.tenantId);
  }

  @Patch('config')
  updateConfig(@Req() req, @Body() body: any) {
    return this.aiService.updateConfig(req.tenantId, body);
  }

  @Get('logs')
  getLogs(@Req() req) {
    return this.aiService.getLogs(req.tenantId);
  }

  @Post('simulate')
  simulate(@Req() req, @Body() body: { message: string }) {
    return this.aiService.simulate(req.tenantId, body.message);
  }
}
