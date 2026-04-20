import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderFromConversationDto } from './dto/create-order-from-conversation.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('api/v1/orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Req() req, @Query() query: any) {
    return this.ordersService.findAll(req.tenantId, query);
  }

  @Get('conversation/:convId')
  findByConversation(@Req() req, @Param('convId') convId: string) {
    return this.ordersService.findByConversation(req.tenantId, convId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.ordersService.findOne(req.tenantId, id);
  }

  @Post()
  create(@Req() req, @Body() body: CreateOrderDto) {
    return this.ordersService.create(req.tenantId, req.userId, body);
  }

  @Post('from-conversation')
  createFromConversation(@Req() req, @Body() body: CreateOrderFromConversationDto) {
    return this.ordersService.createFromConversation(req.tenantId, req.userId, body);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() body: UpdateOrderDto) {
    return this.ordersService.update(req.tenantId, id, body);
  }

  @Post(':id/confirm-whatsapp')
  sendConfirmation(@Req() req, @Param('id') id: string, @Body() body: { template_id: string }) {
    return this.ordersService.sendWhatsAppConfirmation(req.tenantId, id, body.template_id);
  }
}
