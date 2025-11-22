import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DisputeDocument = HydratedDocument<Dispute>;

// Status Enum matches "Phase 3" of the Payroll Tracking workflow
export enum DisputeStatus {
  OPEN = 'Open',                     // Submitted by employee
  UNDER_REVIEW = 'Under Review',     // Being checked by Payroll Specialist
  RESOLVED = 'Resolved',             // Valid error found and fixed
  REJECTED = 'Rejected',             // Dispute invalid (calculation was correct)
}

@Schema({ timestamps: true, versionKey: false })
export class Dispute {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  // Link the dispute to the specific Payslip that has the error
  @Prop({ type: Types.ObjectId, ref: 'Payslip', required: true })
  payslipId: Types.ObjectId;

  @Prop({ required: true })
  reason: string; // Why the employee thinks the salary is wrong

  @Prop({ 
    required: true, 
    enum: DisputeStatus, 
    default: DisputeStatus.OPEN 
  })
  status: string;

  @Prop()
  adminComment: string; // Notes from HR/Payroll explaining the resolution/rejection
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);