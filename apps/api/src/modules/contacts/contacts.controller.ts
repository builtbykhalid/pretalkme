import { Controller, Get, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@UseGuards(JwtGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll(@Req() req) {
    return this.contactsService.findAll(req.tenantId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.contactsService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.contactsService.update(req.tenantId, id, body);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.contactsService.delete(req.tenantId, id);
  }
}
