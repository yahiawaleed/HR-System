import { Schema } from 'mongoose';

export const AttendanceCorrectionRequestSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance' },
    date: { type: Date, required: true },
    requestedChanges: {
      clockIn: Date,
      clockOut: Date,
      status: String,
      notes: String,
    },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

AttendanceCorrectionRequestSchema.index({ status: 1 });

