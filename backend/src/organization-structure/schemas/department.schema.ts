import { Schema } from 'mongoose';

export const DepartmentSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    parentDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
    headId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    isActive: { type: Boolean, default: true, index: true },
    deactivatedAt: { type: Date },
    deactivatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

DepartmentSchema.index({ code: 1 });
DepartmentSchema.index({ isActive: 1 });

