// dispute.schema.ts
import { Schema } from 'mongoose';

export const DisputeSchema = new Schema(
  {
    payrollId: { type: Schema.Types.ObjectId, ref: 'Payroll', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['open', 'review', 'resolved'], default: 'open' },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);