import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DepartmentService } from '../services/department.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  async findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateDepartmentDto>, @Request() req) {
    return this.departmentService.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string, @Request() req) {
    return this.departmentService.deactivate(id, req.user.userId);
  }
}

