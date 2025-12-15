import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PositionService } from '../services/position.service';
import { CreatePositionDto } from '../dto/create-position.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  async create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionService.create(createPositionDto);
  }

  @Get()
  async findAll() {
    return this.positionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  @Get('department/:departmentId')
  async findByDepartment(@Param('departmentId') departmentId: string) {
    return this.positionService.findByDepartment(departmentId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreatePositionDto>, @Request() req) {
    return this.positionService.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string, @Request() req) {
    return this.positionService.deactivate(id, req.user.userId);
  }
}

