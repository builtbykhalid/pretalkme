import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/v1/widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get('config/:publicKey')
  getConfig(@Param('publicKey') publicKey: string) {
    return this.widgetService.getPublicConfig(publicKey);
  }

  @Post('session')
  startSession(@Body() body: { publicKey: string; visitorId: string; pageUrl?: string; userAgent?: string }) {
    return this.widgetService.startSession(body);
  }

  @Post('message')
  sendMessage(@Body() body: { sessionId: string; visitorId: string; publicKey: string; text: string }) {
    return this.widgetService.receiveMessage(body);
  }

  @Get('messages/:sessionId')
  getMessages(@Param('sessionId') sessionId: string, @Query('since') since?: string) {
    return this.widgetService.getMessages(sessionId, since);
  }

  @Get('settings')
  @UseGuards(JwtGuard)
  getSettings(@Req() req) {
    return this.widgetService.getSettings(req.tenantId);
  }

  @Post('settings')
  @UseGuards(JwtGuard)
  updateSettings(@Req() req, @Body() body: { enabled?: boolean; brand_color?: string; greeting?: string }) {
    return this.widgetService.updateSettings(req.tenantId, body);
  }
}
