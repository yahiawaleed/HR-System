import { Schema } from 'mongoose';

const RatingScaleItemSchema = new Schema(
  {
    value: { type: Number, required: true },
    label: { type: String, required: true },
    description: { type: String },
  },
  { _id: false }
);

const EvaluationCriteriaSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    weight: { type: Number, default: 1 },
    maxScore: { type: Number, default: 5 },
  },
  { _id: false }
);

export const AppraisalTemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['annual', 'probationary', 'mid_year', 'quarterly'],
      required: true,
    },
    ratingScale: { type: [RatingScaleItemSchema], required: true },
    evaluationCriteria: { type: [EvaluationCriteriaSchema], required: true },
    departmentIds: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

