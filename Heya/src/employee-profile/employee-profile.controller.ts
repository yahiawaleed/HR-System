import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';

@Controller('employee-profile')
export class EmployeeProfileController {
  constructor(private readonly employeeService: EmployeeProfileService) {}

  @Get()
  async findAll() {
    return this.employeeService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    return this.employeeService.create(body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }
}
