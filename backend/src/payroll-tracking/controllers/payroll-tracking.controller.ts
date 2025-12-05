import { Controller, Get } from '@nestjs/common';
import { PayrollTrackingService } from '../services/payroll-tracking.service';

@Controller('payroll-tracking')
export class PayrollTrackingController {
  constructor(private readonly payrollTrackingService: PayrollTrackingService) {}

  @Get('payslips')
  async getPayslips() {
    return this.payrollTrackingService.findAllPayslips();
  }

  @Get('claims')
  async getClaims() {
    return this.payrollTrackingService.findAllClaims();
  }

  @Get('disputes')
  async getDisputes() {
    return this.payrollTrackingService.findAllDisputes();
  }
}

