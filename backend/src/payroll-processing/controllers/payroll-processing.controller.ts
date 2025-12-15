import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { PayrollProcessingService } from '../services/payroll-processing.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('payroll-processing')
@UseGuards(JwtAuthGuard)
export class PayrollProcessingController {
  constructor(private readonly payrollProcessingService: PayrollProcessingService) {}

  @Post('initiate')
  async initiatePayroll(@Body() body: { periodStart: Date; periodEnd: Date }) {
    return this.payrollProcessingService.initiatePayroll(
      new Date(body.periodStart),
      new Date(body.periodEnd),
    );
  }

  @Post(':id/generate-draft')
  async generateDraft(@Param('id') id: string) {
    return this.payrollProcessingService.generateDraft(id);
  }

  @Patch(':id/approve')
  async approvePayroll(@Param('id') id: string, @Request() req) {
    return this.payrollProcessingService.approvePayroll(id, req.user.userId, req.user.role);
  }

  @Patch(':id/lock')
  async lockPayroll(@Param('id') id: string, @Request() req) {
    return this.payrollProcessingService.lockPayroll(id, req.user.userId);
  }

  @Get()
  async findAll() {
    // This would need a service method to find all payrolls
    return { message: 'Get all payrolls - to be implemented' };
  }
}

