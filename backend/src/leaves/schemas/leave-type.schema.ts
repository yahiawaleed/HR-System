import { Schema } from 'mongoose';

export const LeaveTypeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['annual', 'sick', 'maternity', 'unpaid', 'mission', 'marriage', 'other'],
      required: true,
    },
    deductsFromAnnual: { type: Boolean, default: false },
    requiresDocumentation: { type: Boolean, default: false },
    maxDays: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

