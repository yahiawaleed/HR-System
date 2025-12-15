import { Schema } from 'mongoose';

export const CandidateSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    resume: { type: String }, // URL to resume file
    coverLetter: { type: String },
    jobPostingId: { type: Schema.Types.ObjectId, ref: 'JobPosting', required: true, index: true },
    status: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'],
      default: 'applied',
      index: true,
    },
    appliedDate: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

CandidateSchema.index({ jobPostingId: 1, status: 1 });
CandidateSchema.index({ email: 1 });

