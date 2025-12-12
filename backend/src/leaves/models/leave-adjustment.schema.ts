import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AdjustmentType } from '../enums/adjustment-type.enum';

export type LeaveAdjustmentDocument = HydratedDocument<LeaveAdjustment>;

@Schema({ timestamps: true })
export class LeaveAdjustment {
  // EMPLOYEE WHOSE BALANCE IS BEING ADJUSTED
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  // LEAVE TYPE BEING ADJUSTED
  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  // ADD / DEDUCT / CORRECTION
  @Prop({ enum: AdjustmentType, required: true })
  adjustmentType: AdjustmentType;

  // NUMBER OF DAYS (+ OR -)
  @Prop({ required: true })
  amount: number;

  // REASON FOR ADJUSTMENT
  @Prop({ required: true })
  reason: string;

  // HR EMPLOYEE WHO PERFORMED THE ADJUSTMENT
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  hrUserId: Types.ObjectId;
}

export const LeaveAdjustmentSchema =
  SchemaFactory.createForClass(LeaveAdjustment);
