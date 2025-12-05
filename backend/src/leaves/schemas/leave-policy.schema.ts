import { Schema } from 'mongoose';

export const LeavePolicySchema = new Schema(
  {
    name: { type: String, required: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    accrualRate: { type: Number, default: 0 }, // days per month
    accrualFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      default: 'monthly',
    },
    maxCarryOver: { type: Number, default: 0 },
    resetDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

