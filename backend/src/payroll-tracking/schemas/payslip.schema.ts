// payslip.schema.ts
import { Schema } from 'mongoose';

const DeductionSubSchema = new Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const TaxBreakdownSubSchema = new Schema(
  {
    federal: { type: Number, default: 0 },
    state: { type: Number, default: 0 },
    socialSecurity: { type: Number, default: 0 },
    medicare: { type: Number, default: 0 },
  },
  { _id: false }
);

export const PayslipSchema = new Schema(
  {
    payrollId: { type: Schema.Types.ObjectId, ref: 'Payroll', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    issuedAt: { type: Date, default: Date.now },
    grossPay: { type: Number, required: true, min: 0 },
    netPay: { type: Number, required: true, min: 0 },
    baseSalary: { type: Number, min: 0 },
    overtimePay: { type: Number, default: 0, min: 0 },
    bonusPay: { type: Number, default: 0, min: 0 },
    transportationAllowance: { type: Number, default: 0 },
    housingAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },
    taxBreakdown: { type: TaxBreakdownSubSchema, default: {} },
    deductions: { type: [DeductionSubSchema], default: [] },
    notes: { type: String },
    finalized: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);