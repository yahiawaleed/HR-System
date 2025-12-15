import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { CreatePayslipDto } from '../dto/create-payslip.dto';

export interface Payslip extends Document {
  payrollId: any;
  employeeId: any;
  periodStart: Date;
  periodEnd: Date;
  issuedAt: Date;
  grossPay: number;
  netPay: number;
  baseSalary?: number;
  overtimePay?: number;
  bonusPay?: number;
  taxBreakdown?: any;
  deductions?: any[];
  notes?: string;
  finalized: boolean;
}

@Injectable()
export class PayslipService {
  constructor(@InjectModel('Payslip') private payslipModel: Model<Payslip>) {}

  async create(createPayslipDto: CreatePayslipDto): Promise<Payslip> {
    const createdPayslip = new this.payslipModel(createPayslipDto);
    return createdPayslip.save();
  }

  async findAll(): Promise<Payslip[]> {
    return this.payslipModel.find().populate('employeeId').populate('payrollId').exec();
  }

  async findOne(id: string): Promise<Payslip | null> {
    return this.payslipModel.findById(id).populate('employeeId').populate('payrollId').exec();
  }

  async findByEmployee(employeeId: string): Promise<Payslip[]> {
    return this.payslipModel.find({ employeeId }).populate('payrollId').exec();
  }
}

