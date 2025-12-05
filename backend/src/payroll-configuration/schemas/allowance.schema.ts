import { Schema } from 'mongoose';

export const AllowanceSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['transportation', 'housing', 'meal', 'communication', 'other'],
      required: true,
    },
    amount: { type: Number, default: 0 },
    isPercentage: { type: Boolean, default: false },
    percentageOf: { type: String }, // e.g., 'base_salary'
    isTaxable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

