import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PayslipService } from '../services/payslip.service';
import { CreatePayslipDto } from '../dto/create-payslip.dto';

@Controller('payslips')
export class PayslipController {
  constructor(private readonly payslipService: PayslipService) {}

  @Post()
  async create(@Body() createPayslipDto: CreatePayslipDto) {
    return this.payslipService.create(createPayslipDto);
  }

  @Get()
  async findAll() {
    return this.payslipService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.payslipService.findOne(id);
  }

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.payslipService.findByEmployee(employeeId);
  }
}

