// claim.schema.ts
import { Schema } from 'mongoose';

export const ClaimSchema = new Schema(
  {
    payrollId: { type: Schema.Types.ObjectId, ref: 'Payroll', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: {
      type: String,
      enum: ['expense', 'allowance', 'reimbursement', 'other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    description: { type: String },
    status: {
      type: String,
      enum: ['PENDING_SPECIALIST', 'PENDING_MANAGER', 'APPROVED_FINANCE', 'REJECTED', 'REFUNDED'],
      default: 'PENDING_SPECIALIST',
      index: true,
    },
    approvalChain: [
      {
        approverId: { type: Schema.Types.ObjectId, ref: 'Employee' },
        role: { type: String },
        status: { type: String },
        date: { type: Date, default: Date.now },
        notes: { type: String },
      }
    ],
    submittedAt: { type: Date, default: Date.now },
    decisionAt: { type: Date },
    approverId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);