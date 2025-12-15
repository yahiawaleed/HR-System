// timesheet.schema.ts
import { Schema } from 'mongoose';

export const TimesheetSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    clockIn: { type: Date },
    clockOut: { type: Date },
    hoursWorked: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'on_leave', 'holiday'],
      default: 'present',
    },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

