import { Schema } from 'mongoose';

export const AppraisalCycleSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'AppraisalTemplate', required: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'in_review', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

AppraisalCycleSchema.index({ status: 1 });
AppraisalCycleSchema.index({ startDate: 1, endDate: 1 });

