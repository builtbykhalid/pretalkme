import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleSheetsService } from './google-sheets.service';

@Controller('api/v1/google-sheets')
export class GoogleSheetsController {
  constructor(
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  @Get('auth-url')
  @UseGuards(JwtGuard)
  getAuthUrl(@Req() req) {
    return { url: this.googleOAuthService.getAuthUrl(req.tenantId) };
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    await this.googleOAuthService.exchangeCode(state, code);
    return res.status(200).json({ success: true });
  }

  @Get('config')
  @UseGuards(JwtGuard)
  getConfig(@Req() req) {
    return this.googleSheetsService.getConfig(req.tenantId);
  }

  @Post('config')
  @UseGuards(JwtGuard)
  saveConfig(@Req() req, @Body() body: any) {
    return this.googleSheetsService.saveConfig(req.tenantId, body);
  }

  @Post('test')
  @UseGuards(JwtGuard)
  test(@Req() req) {
    return this.googleSheetsService.testWrite(req.tenantId);
  }

  @Get('sync-logs')
  @UseGuards(JwtGuard)
  syncLogs(@Req() req) {
    return this.googleSheetsService.getSyncLogs(req.tenantId);
  }

  @Post('retry/:logId')
  @UseGuards(JwtGuard)
  retry(@Req() req, @Param('logId') logId: string) {
    return this.googleSheetsService.retryByLog(req.tenantId, logId);
  }
}
