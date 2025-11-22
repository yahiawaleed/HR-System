import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayslipDocument = HydratedDocument<Payslip>;

// 1. Define Enums (Crucial for the specific workflow in PDF Page 10)
export enum PayslipStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  WAITING_FINANCE = 'Waiting Finance',
  PAID = 'Paid',
}

// 2. Define Sub-Schemas as Classes (Nested Objects)
@Schema({ _id: false }) // _id: false because these are just part of the main document
export class Deduction {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  amount: number;
}

@Schema({ _id: false })
export class TaxBreakdown {
  // Adjusted from "Federal/State" to generic Project Description terms
  @Prop({ default: 0 })
  incomeTax: number; 

  @Prop({ default: 0 })
  socialInsurance: number; // PDF mentions "Insurance" specifically [cite: 254]
}

// 3. The Main Schema
@Schema({ timestamps: true, versionKey: false })
export class Payslip {
  // References are handled slightly differently in NestJS
  @Prop({ type: Types.ObjectId, ref: 'Payroll', required: true })
  payrollId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  period: string; // PDF suggests "Month/Year" or a generic period identifier

  @Prop({ required: true })
  periodStart: Date;

  @Prop({ required: true })
  periodEnd: Date;

  // --- Financials ---
  @Prop({ required: true, min: 0 })
  grossPay: number;

  @Prop({ required: true, min: 0 })
  netPay: number;

  @Prop({ min: 0 })
  baseSalary: number;

  @Prop({ default: 0, min: 0 })
  overtimePay: number;

  @Prop({ default: 0, min: 0 })
  bonusPay: number;

  @Prop({ default: 0 })
  transportationAllowance: number; // Explicitly mentioned in PDF 

  // --- Nested Objects ---
  // We use the Class we defined above as the type
  @Prop({ type: TaxBreakdown, default: {} })
  taxBreakdown: TaxBreakdown;

  @Prop({ type: [SchemaFactory.createForClass(Deduction)], default: [] })
  deductions: Deduction[];

  // --- Workflow Status ---
  // Replaced "finalized: boolean" with the specific Status Enum from the PDF
  @Prop({ 
    required: true, 
    enum: PayslipStatus, 
    default: PayslipStatus.DRAFT 
  })
  status: string;

  @Prop()
  notes: string;
}

// 4. Generate the Schema Factory (Standard NestJS boilerplate)
export const PayslipSchema = SchemaFactory.createForClass(Payslip);