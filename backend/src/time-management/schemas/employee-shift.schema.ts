import { Schema } from 'mongoose';

export const EmployeeShiftSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

EmployeeShiftSchema.index({ employeeId: 1, isActive: 1 });
EmployeeShiftSchema.index({ startDate: 1, endDate: 1 });

