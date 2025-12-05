import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'system_admin',
        'hr_manager',
        'hr_employee',
        'hr_admin',
        'payroll_manager',
        'payroll_specialist',
        'finance_staff',
        'legal_admin',
        'department_manager',
        'line_manager',
        'employee',
      ],
      required: true,
    },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.index({ email: 1 });
UserSchema.index({ employeeId: 1 });

