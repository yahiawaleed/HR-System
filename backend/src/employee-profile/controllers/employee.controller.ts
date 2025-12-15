import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto, @Request() req) {
    return this.employeeService.create(createEmployeeDto, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Get('number/:employeeNumber')
  async findByEmployeeNumber(@Param('employeeNumber') employeeNumber: string) {
    return this.employeeService.findByEmployeeNumber(employeeNumber);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Request() req,
  ) {
    return this.employeeService.update(id, updateEmployeeDto, req.user.userId);
  }

  @Get('department/:departmentId')
  async findByDepartment(@Param('departmentId') departmentId: string) {
    return this.employeeService.findByDepartment(departmentId);
  }

  @Get('manager/:managerId')
  async findByManager(@Param('managerId') managerId: string) {
    return this.employeeService.findByManager(managerId);
  }
}

