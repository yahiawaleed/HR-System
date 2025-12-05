import { Schema } from 'mongoose';

const AddressSubSchema = new Schema(
  {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  { _id: false }
);

const EmergencyContactSubSchema = new Schema(
  {
    name: String,
    relationship: String,
    phone: String,
    email: String,
  },
  { _id: false }
);

export const EmployeeSchema = new Schema(
  {
    employeeNumber: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: AddressSubSchema },
    emergencyContact: { type: EmergencyContactSubSchema },
    profilePicture: { type: String },
    
    // Employment Information
    hireDate: { type: Date, required: true },
    workReceivingDate: { type: Date },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated', 'resigned'],
      default: 'active',
      index: true,
    },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    positionId: { type: Schema.Types.ObjectId, ref: 'Position', index: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    payGradeId: { type: Schema.Types.ObjectId, ref: 'PayGrade' },
    
    // Additional Information
    nationalId: { type: String },
    passportNumber: { type: String },
    taxId: { type: String },
    bankAccount: {
      bankName: String,
      accountNumber: String,
      routingNumber: String,
    },
    
    // Metadata
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ employeeNumber: 1 });
EmployeeSchema.index({ departmentId: 1, positionId: 1 });
EmployeeSchema.index({ managerId: 1 });
EmployeeSchema.index({ status: 1 });

