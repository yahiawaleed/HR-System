import { Schema } from 'mongoose';

export const PositionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    reportsToPositionId: { type: Schema.Types.ObjectId, ref: 'Position', default: null },
    payGradeId: { type: Schema.Types.ObjectId, ref: 'PayGrade' },
    isActive: { type: Boolean, default: true, index: true },
    deactivatedAt: { type: Date },
    deactivatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

PositionSchema.index({ code: 1 });
PositionSchema.index({ departmentId: 1, isActive: 1 });

