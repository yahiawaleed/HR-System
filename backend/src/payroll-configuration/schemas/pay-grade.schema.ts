import { Schema } from 'mongoose';

export const PayGradeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    baseSalary: { type: Number, required: true },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

