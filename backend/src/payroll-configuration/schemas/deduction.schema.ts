import { Schema } from 'mongoose';

export const DeductionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['tax', 'insurance', 'loan', 'penalty', 'other'],
      required: true,
    },
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: false },
    percentageOf: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

