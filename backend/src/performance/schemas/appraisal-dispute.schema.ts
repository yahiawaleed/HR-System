import { Schema } from 'mongoose';

export const AppraisalDisputeSchema = new Schema(
  {
    appraisalId: { type: Schema.Types.ObjectId, ref: 'Appraisal', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    reason: { type: String, required: true },
    disputedFields: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    resolution: { type: String },
    finalRating: { type: Number },
  },
  { timestamps: true, versionKey: false }
);

AppraisalDisputeSchema.index({ appraisalId: 1 });
AppraisalDisputeSchema.index({ status: 1 });

