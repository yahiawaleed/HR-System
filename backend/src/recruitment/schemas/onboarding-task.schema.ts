import { Schema } from 'mongoose';

export const OnboardingTaskSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['documentation', 'access', 'training', 'equipment', 'orientation', 'other'],
      required: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    dueDate: { type: Date },
    completedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

OnboardingTaskSchema.index({ employeeId: 1, status: 1 });

