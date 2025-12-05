import { Schema } from 'mongoose';

export const SigningBonusSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

SigningBonusSchema.index({ employeeId: 1, status: 1 });

