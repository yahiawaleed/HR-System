import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';

@Controller('payroll-execution')
export class PayrollExecutionController {
    constructor(private readonly payrollExecutionService: PayrollExecutionService) {}

    @Post('runs')
    async createPayrollRun(@Body() createRunDto: any) {
        return this.payrollExecutionService.createPayrollRun(createRunDto);
    }

    @Get('runs')
    async getPayrollRuns() {
        return this.payrollExecutionService.getPayrollRuns();
    }

    @Post('runs/:id/generate-payslips')
    async generatePayslips(@Param('id') id: string) {
        return this.payrollExecutionService.generatePayslipsForRun(id);
    }
}
