import { Schema } from 'mongoose';

export const TerminationBenefitSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    type: {
      type: String,
      enum: ['resignation', 'termination', 'retirement'],
      required: true,
    },
    severancePay: { type: Number, default: 0 },
    accruedLeavePayment: { type: Number, default: 0 },
    noticePeriodPayment: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paymentDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

TerminationBenefitSchema.index({ employeeId: 1, status: 1 });

