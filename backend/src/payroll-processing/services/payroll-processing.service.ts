import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export interface Payroll extends Document {
  [key: string]: any;
}

export interface Payslip extends Document {
  [key: string]: any;
}

@Injectable()
export class PayrollProcessingService {
  constructor(
    @InjectModel('Payroll') private payrollModel: Model<Payroll>,
    @InjectModel('Payslip') private payslipModel: Model<Payslip>,
    @InjectModel('Employee') private employeeModel: Model<any>,
    @InjectModel('PayGrade') private payGradeModel: Model<any>,
    @InjectModel('Attendance') private attendanceModel: Model<any>,
  ) {}

  async initiatePayroll(periodStart: Date, periodEnd: Date): Promise<Payroll> {
    // Check if payroll for this period already exists
    const existing = await this.payrollModel.findOne({
      periodStart,
      periodEnd,
    }).exec();

    if (existing) {
      throw new BadRequestException('Payroll for this period already exists');
    }

    const payroll = new this.payrollModel({
      periodStart,
      periodEnd,
      status: 'draft',
    });

    return payroll.save();
  }

  async generateDraft(payrollId: string): Promise<Payroll> {
    const payroll = await this.payrollModel.findById(payrollId).exec();
    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }

    // Fetch all active employees
    const employees = await this.employeeModel.find({ status: 'active' }).exec();

    let totalGrossPay = 0;
    let totalNetPay = 0;
    let totalDeductions = 0;

    // Generate payslips for each employee
    for (const employee of employees) {
      const payslip = await this.calculatePayslip(employee, payroll._id.toString(), payroll.periodStart, payroll.periodEnd);
      
      totalGrossPay += payslip.grossPay;
      totalNetPay += payslip.netPay;
      totalDeductions += payslip.grossPay - payslip.netPay;
    }

    payroll.totalGrossPay = totalGrossPay;
    payroll.totalNetPay = totalNetPay;
    payroll.totalDeductions = totalDeductions;
    payroll.employeeCount = employees.length;
    payroll.status = 'under_review';

    return payroll.save();
  }

  async approvePayroll(payrollId: string, approverId: string, role: string): Promise<Payroll> {
    const payroll = await this.payrollModel.findById(payrollId).exec();
    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }

    if (role === 'payroll_manager') {
      payroll.status = 'waiting_finance_approval';
      payroll.approvedBy = approverId;
      payroll.approvedAt = new Date();
    } else if (role === 'finance_staff') {
      payroll.status = 'approved';
      payroll.approvedBy = approverId;
      payroll.approvedAt = new Date();
    }

    return payroll.save();
  }

  async lockPayroll(payrollId: string, userId: string): Promise<Payroll> {
    const payroll = await this.payrollModel.findById(payrollId).exec();
    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }

    if (payroll.status !== 'approved') {
      throw new BadRequestException('Payroll must be approved before locking');
    }

    payroll.status = 'locked';
    payroll.lockedBy = userId;
    payroll.lockedAt = new Date();

    return payroll.save();
  }

  private async calculatePayslip(employee: any, payrollId: string, periodStart: Date, periodEnd: Date): Promise<any> {
    // Get pay grade
    const payGrade = await this.payGradeModel.findById(employee.payGradeId).exec();
    if (!payGrade) {
      throw new NotFoundException(`Pay grade not found for employee ${employee._id}`);
    }

    // Calculate base salary (assuming monthly)
    const baseSalary = payGrade.baseSalary || 0;

    // Get attendance for the period
    const attendanceRecords = await this.attendanceModel.find({
      employeeId: employee._id,
      date: { $gte: periodStart, $lte: periodEnd },
    }).exec();

    // Calculate worked hours
    const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
    const overtimeHours = attendanceRecords.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);

    // Calculate gross pay
    const dailyRate = baseSalary / 30; // Assuming 30 days per month
    const workedDays = totalHours / 8; // Assuming 8 hours per day
    const grossPay = baseSalary * (workedDays / 30);

    // Calculate deductions (simplified - should use tax rules and insurance rules)
    const taxDeduction = grossPay * 0.1; // 10% tax (simplified)
    const insuranceDeduction = grossPay * 0.05; // 5% insurance (simplified)
    const totalDeductions = taxDeduction + insuranceDeduction;

    // Calculate net pay
    const netPay = grossPay - totalDeductions;

    // Create or update payslip
    const payslip = await this.payslipModel.findOneAndUpdate(
      {
        payrollId: payrollId,
        employeeId: employee._id,
      },
      {
        payrollId: payrollId,
        employeeId: employee._id,
        periodStart,
        periodEnd,
        grossPay,
        netPay,
        baseSalary,
        deductions: [
          { label: 'Tax', amount: taxDeduction },
          { label: 'Insurance', amount: insuranceDeduction },
        ],
        finalized: false,
      },
      { upsert: true, new: true },
    ).exec();

    return payslip;
  }
}

