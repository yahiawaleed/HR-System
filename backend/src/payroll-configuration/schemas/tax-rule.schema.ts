import { Schema } from 'mongoose';

const TaxBracketSchema = new Schema(
  {
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number },
    rate: { type: Number, required: true }, // percentage
  },
  { _id: false }
);

export const TaxRuleSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['federal', 'state', 'local', 'social_security', 'medicare'],
      required: true,
    },
    brackets: { type: [TaxBracketSchema], required: true },
    effectiveDate: { type: Date, required: true },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

TaxRuleSchema.index({ type: 1, isActive: 1 });

