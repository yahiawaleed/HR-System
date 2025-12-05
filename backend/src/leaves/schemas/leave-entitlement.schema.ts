import { Schema } from 'mongoose';

export const LeaveEntitlementSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    totalDays: { type: Number, required: true, default: 0 },
    accruedDays: { type: Number, default: 0 },
    takenDays: { type: Number, default: 0 },
    remainingDays: { type: Number, default: 0 },
    pendingDays: { type: Number, default: 0 },
    carryOverDays: { type: Number, default: 0 },
    year: { type: Number, required: true },
    resetDate: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

LeaveEntitlementSchema.index({ employeeId: 1, leaveTypeId: 1, year: 1 }, { unique: true });

