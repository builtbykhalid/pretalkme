import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { PlanGuard, PlanMetric } from '../../common/guards/plan.guard';
import { ConversationsService } from './conversations.service';

@Controller('api/v1/conversations')
@UseGuards(JwtGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAll(@Req() req, @Query() query) {
    return this.conversationsService.findAll(req.tenantId, query);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.conversationsService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() body) {
    return this.conversationsService.update(req.tenantId, id, body);
  }

  @Post(':id/takeover')
  takeOver(@Req() req, @Param('id') id: string) {
    return this.conversationsService.takeOver(req.tenantId, id, req.userId);
  }

  @Post(':id/release-ai')
  releaseToAI(@Req() req, @Param('id') id: string) {
    return this.conversationsService.releaseToAI(req.tenantId, id);
  }

  @Get(':id/messages')
  getMessages(@Req() req, @Param('id') id: string, @Query() query) {
    return this.conversationsService.getMessages(req.tenantId, id, query);
  }

  @Post(':id/messages')
  @PlanMetric('conversations_month')
  @UseGuards(PlanGuard)
  sendMessage(@Req() req, @Param('id') id: string, @Body() body) {
    return this.conversationsService.sendManualMessage(req.tenantId, id, req.userId, body);
  }

  @Post(':id/notes')
  addNote(@Req() req, @Param('id') id: string, @Body() body) {
    return this.conversationsService.addNote(req.tenantId, id, req.userId, body.content);
  }
}
