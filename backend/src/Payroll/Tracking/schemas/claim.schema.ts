import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClaimDocument = HydratedDocument<Claim>;

// Status Enum matches "Phase 3 & 4" of the Payroll Tracking workflow (Approval -> Refund)
export enum ClaimStatus {
  PENDING = 'Pending',       // Initial state
  APPROVED = 'Approved',     // Approved by Payroll Specialist/Manager
  REJECTED = 'Rejected',     // Rejected by Payroll/Manager
  REFUNDED = 'Refunded',     // Processed by Finance Staff
}

@Schema({ timestamps: true, versionKey: false })
export class Claim {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, default: 'EUR' }) // Default currency (adjust as needed)
  currency: string;

  @Prop({ required: true })
  title: string; // e.g., "Travel Expense"

  @Prop({ required: true })
  description: string; // Detailed justification

  @Prop()
  attachmentUrl: string; // URL to the receipt image/PDF (optional for now)

  @Prop({ 
    required: true, 
    enum: ClaimStatus, 
    default: ClaimStatus.PENDING 
  })
  status: string;

  @Prop()
  rejectionReason: string; // Populated if status is REJECTED
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);