import { Schema } from 'mongoose';

const RatingSubSchema = new Schema(
  {
    criteriaName: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    comments: { type: String },
  },
  { _id: false }
);

export const AppraisalSchema = new Schema(
  {
    cycleId: { type: Schema.Types.ObjectId, ref: 'AppraisalCycle', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'AppraisalTemplate', required: true },
    overallRating: { type: Number },
    ratings: { type: [RatingSubSchema], default: [] },
    strengths: { type: String },
    areasForImprovement: { type: String },
    developmentRecommendations: { type: String },
    employeeComments: { type: String },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'published', 'disputed', 'finalized'],
      default: 'draft',
      index: true,
    },
    submittedAt: { type: Date },
    publishedAt: { type: Date },
    acknowledgedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

AppraisalSchema.index({ cycleId: 1, employeeId: 1 });
AppraisalSchema.index({ employeeId: 1, status: 1 });

