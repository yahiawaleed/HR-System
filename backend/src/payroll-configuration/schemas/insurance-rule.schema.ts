import { Schema } from 'mongoose';

export const InsuranceRuleSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['health', 'dental', 'vision', 'life', 'disability', 'other'],
      required: true,
    },
    employeeContribution: { type: Number, required: true }, // percentage or fixed amount
    employerContribution: { type: Number, required: true },
    isPercentage: { type: Boolean, default: true },
    percentageOf: { type: String, default: 'base_salary' },
    isActive: { type: Boolean, default: true },
    effectiveDate: { type: Date, required: true },
    expiryDate: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

InsuranceRuleSchema.index({ type: 1, isActive: 1 });

