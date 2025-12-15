import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClaimDocument = HydratedDocument<Claim>;

export enum ClaimStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  REFUNDED = 'Refunded',
}

@Schema({ timestamps: true, versionKey: false })
export class Claim {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  description: string; // Justification for the expense

  @Prop()
  attachmentUrl: string; // Receipt image/PDF

  @Prop({ required: true, enum: ClaimStatus, default: ClaimStatus.PENDING })
  status: string;

  @Prop()
  rejectionReason: string; // Optional feedback if rejected
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);