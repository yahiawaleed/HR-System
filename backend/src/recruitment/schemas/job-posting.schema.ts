import { Schema } from 'mongoose';

export const JobPostingSchema = new Schema(
  {
    title: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    positionId: { type: Schema.Types.ObjectId, ref: 'Position', required: true },
    description: { type: String, required: true },
    requirements: { type: String },
    responsibilities: { type: String },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    postedDate: { type: Date },
    closingDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

JobPostingSchema.index({ status: 1 });
JobPostingSchema.index({ departmentId: 1, positionId: 1 });

