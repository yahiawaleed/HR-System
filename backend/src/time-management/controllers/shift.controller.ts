import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { ShiftService } from '../services/shift.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  async create(@Body() shiftData: any, @Request() req) {
    return this.shiftService.create(shiftData, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.shiftService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.shiftService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.shiftService.update(id, updateData);
  }
}

