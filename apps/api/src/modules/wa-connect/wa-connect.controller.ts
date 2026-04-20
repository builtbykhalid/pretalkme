import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { WaConnectService } from './wa-connect.service';

@Controller('api/v1/wa')
@UseGuards(JwtGuard)
export class WaConnectController {
  constructor(private readonly service: WaConnectService) {}

  @Post('connect')
  connect(@Req() req) {
    return this.service.connect(req.tenantId);
  }

  @Get('status')
  status(@Req() req) {
    return this.service.status(req.tenantId);
  }

  @Post('disconnect')
  disconnect(@Req() req) {
    return this.service.disconnect(req.tenantId);
  }

  @Get('qr')
  qr(@Req() req) {
    return this.service.qr(req.tenantId);
  }
}
