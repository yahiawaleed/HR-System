// payroll.schema.ts
import { Schema } from 'mongoose';

export const PayrollSchema = new Schema(
  {
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'under_review', 'waiting_finance_approval', 'approved', 'locked', 'paid'],
      default: 'draft',
      index: true,
    },
    totalGrossPay: { type: Number, default: 0 },
    totalNetPay: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    employeeCount: { type: Number, default: 0 },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
    approvedAt: { type: Date },
    lockedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
    lockedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

