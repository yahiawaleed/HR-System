import { Schema } from 'mongoose';

export const AttendanceSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true, index: true },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
    clockIn: { type: Date },
    clockOut: { type: Date },
    hoursWorked: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'on_leave', 'holiday', 'half_day'],
      default: 'present',
    },
    isLate: { type: Boolean, default: false },
    lateMinutes: { type: Number, default: 0 },
    notes: { type: String },
    correctedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    correctedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1, status: 1 });

