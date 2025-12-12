// dispute.schema.ts
import { Schema } from 'mongoose';

export const DisputeSchema = new Schema(
  {
    payrollId: { type: Schema.Types.ObjectId, ref: 'Payroll', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'PENDING_SPECIALIST', 'PENDING_MANAGER', 'RESOLVED_REFUNDED', 'RESOLVED_REJECTED'],
      default: 'OPEN'
    },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String },
    refundAmount: { type: Number, default: 0 },
    assignedSpecialistId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true, versionKey: false }
);