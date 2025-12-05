import { Schema } from 'mongoose';

export const JobOfferSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    jobPostingId: { type: Schema.Types.ObjectId, ref: 'JobPosting', required: true },
    positionId: { type: Schema.Types.ObjectId, ref: 'Position', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    offerDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    salary: { type: Number, required: true },
    benefits: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

JobOfferSchema.index({ candidateId: 1 });
JobOfferSchema.index({ status: 1 });

