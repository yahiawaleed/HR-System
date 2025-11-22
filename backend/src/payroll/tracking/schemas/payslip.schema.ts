import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayslipDocument = HydratedDocument<Payslip>;

export enum PayslipStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  WAITING_FINANCE = 'Waiting Finance',
  PAID = 'Paid',
}

@Schema({ timestamps: true, versionKey: false })
export class Payslip {
  // --- Identity & Period ---
  @Prop({ type: Types.ObjectId, ref: 'Payroll', required: true })
  payrollId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  period: string; // e.g. "11-2025"

  // --- Earnings ---
  @Prop({ required: true, min: 0 })
  baseSalary: number;

  @Prop({ default: 0, min: 0 })
  grossPay: number; // The total before deductions

  @Prop({ default: 0 })
  transportationAllowance: number; // [cite: 282]

  @Prop({ default: 0 })
  leaveCompensation: number; // [cite: 282]

  // --- Deductions ---
  @Prop({ default: 0 })
  tax: number; // 

  @Prop({ default: 0 })
  insurance: number; // 

  @Prop({ default: 0 })
  penalties: number; // [cite: 257]

  // --- Result ---
  @Prop({ required: true })
  netSalary: number; // The final amount paid

  // --- Workflow ---
  @Prop({ required: true, enum: PayslipStatus, default: PayslipStatus.DRAFT })
  status: string;
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);