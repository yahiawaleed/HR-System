import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PayrollConfigService } from '../services/payroll-config.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('payroll-config')
@UseGuards(JwtAuthGuard)
export class PayrollConfigController {
  constructor(private readonly payrollConfigService: PayrollConfigService) {}

  // Pay Grades
  @Post('pay-grades')
  async createPayGrade(@Body() payGradeData: any) {
    return this.payrollConfigService.createPayGrade(payGradeData);
  }

  @Get('pay-grades')
  async findAllPayGrades() {
    return this.payrollConfigService.findAllPayGrades();
  }

  // Allowances
  @Post('allowances')
  async createAllowance(@Body() allowanceData: any) {
    return this.payrollConfigService.createAllowance(allowanceData);
  }

  @Get('allowances')
  async findAllAllowances() {
    return this.payrollConfigService.findAllAllowances();
  }

  // Deductions
  @Post('deductions')
  async createDeduction(@Body() deductionData: any) {
    return this.payrollConfigService.createDeduction(deductionData);
  }

  @Get('deductions')
  async findAllDeductions() {
    return this.payrollConfigService.findAllDeductions();
  }

  // Tax Rules
  @Post('tax-rules')
  async createTaxRule(@Body() taxRuleData: any, @Request() req) {
    return this.payrollConfigService.createTaxRule(taxRuleData, req.user.userId);
  }

  @Get('tax-rules')
  async findAllTaxRules() {
    return this.payrollConfigService.findAllTaxRules();
  }

  // Insurance Rules
  @Post('insurance-rules')
  async createInsuranceRule(@Body() insuranceRuleData: any) {
    return this.payrollConfigService.createInsuranceRule(insuranceRuleData);
  }

  @Get('insurance-rules')
  async findAllInsuranceRules() {
    return this.payrollConfigService.findAllInsuranceRules();
  }
}

