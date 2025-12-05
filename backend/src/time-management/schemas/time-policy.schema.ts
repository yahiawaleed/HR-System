import { Schema } from 'mongoose';

export const TimePolicySchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['overtime', 'lateness', 'short_time', 'weekend_work'],
      required: true,
    },
    rules: {
      gracePeriod: { type: Number, default: 0 }, // minutes
      lateThreshold: { type: Number, default: 15 }, // minutes
      penaltyAmount: { type: Number, default: 0 },
      overtimeRate: { type: Number, default: 1.5 }, // multiplier
      requiresApproval: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

