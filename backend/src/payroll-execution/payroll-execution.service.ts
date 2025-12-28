import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paySlip, PayslipDocument } from './models/payslip.schema';
import { payrollRuns, payrollRunsDocument } from './models/payrollRuns.schema';
import { PayRollStatus, PayRollPaymentStatus, PaySlipPaymentStatus } from './enums/payroll-execution-enum';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';

@Injectable()
export class PayrollExecutionService {
    constructor(
        @InjectModel(paySlip.name) private paySlipModel: Model<PayslipDocument>,
        @InjectModel(payrollRuns.name) private payrollRunsModel: Model<payrollRunsDocument>,
        @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfileDocument>
    ) {}

    async getPayslipsByEmployee(employeeId: string): Promise<paySlip[]> {
        return this.paySlipModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }

    async getPayslipById(id: string): Promise<paySlip> {
        const payslip = await this.paySlipModel.findById(id).exec();
        if (!payslip) throw new NotFoundException('Payslip not found');
        return payslip;
    }

    // --- Payroll Run Management (Executed by Payroll Specialist) ---

    async createPayrollRun(data: any): Promise<payrollRuns> {
        const count = await this.payrollRunsModel.countDocuments();
        const runId = `PR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        
        const newRun = new this.payrollRunsModel({
            ...data,
            runId,
            status: PayRollStatus.DRAFT,
            paymentStatus: PayRollPaymentStatus.PENDING
        });
        return newRun.save();
    }

    async getPayrollRuns(): Promise<payrollRuns[]> {
        return this.payrollRunsModel.find().sort({ createdAt: -1 }).exec();
    }

    async generatePayslipsForRun(runId: string): Promise<void> {
        try {
            const payrollRun = await this.payrollRunsModel.findById(runId);
            if (!payrollRun) {
                throw new NotFoundException('Payroll Run not found');
            }

            // For demonstration, we'll generate payslips for all active employees
            const employees = await this.employeeProfileModel.find({ status: 'ACTIVE' }).exec();

            if (employees.length === 0) {
                console.log('No active employees found to generate payslips for.');
                return;
            }

            const payslipsToCreate = employees.map(employee => {
                // Dummy calculation logic
                const grossSalary = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
                const deductions = grossSalary * 0.15; // 15% tax/insurance
                const netPay = grossSalary - deductions;

                return {
                    employeeId: employee._id,
                    payrollRunId: payrollRun._id,
                    earningsDetails: {
                        baseSalary: grossSalary,
                        allowances: [],
                        bonuses: [],
                        benefits: [],
                        refunds: []
                    },
                    deductionsDetails: {
                        taxes: [],
                        insurances: [],
                    },
                    totalGrossSalary: grossSalary,
                    totalDeductions: deductions, 
                    netPay: netPay,
                    paymentStatus: PaySlipPaymentStatus.PAID 
                };
            });

            await this.paySlipModel.insertMany(payslipsToCreate);

            // Update the payroll run status
            payrollRun.status = PayRollStatus.LOCKED;
            payrollRun.paymentStatus = PayRollPaymentStatus.PAID;
            
            // Update totals in payroll run
            payrollRun.employees = employees.length;
            payrollRun.totalnetpay = payslipsToCreate.reduce((sum, p) => sum + p.netPay, 0);
            
            await payrollRun.save();

            console.log(`Generated ${employees.length} payslips for run ${payrollRun.runId}`);
        } catch (error) {
            console.error('Error generating payslips:', error);
            throw new InternalServerErrorException(error.message);
        }
    }
}
