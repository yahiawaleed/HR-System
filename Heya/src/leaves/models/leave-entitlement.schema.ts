import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveEntitlementDocument = HydratedDocument<LeaveEntitlement>;

@Schema({ timestamps: true })
export class LeaveEntitlement {

  // The employee whose entitlement this is
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  // The leave type (Annual, Sick, Maternity, etc.)
  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  // Total entitlement per year
  @Prop({ default: 0 })
  yearlyEntitlement: number;

  // Accrued before rounding
  @Prop({ default: 0 })
  accruedActual: number;

  // Rounded accrued value saved for UI & usage
  @Prop({ default: 0 })
  accruedRounded: number;

  // Carried forward from last cycle
  @Prop({ default: 0 })
  carryForward: number;

  // Approved & consumed leave
  @Prop({ default: 0 })
  taken: number;

  // Pending approval
  @Prop({ default: 0 })
  pending: number;

  // Remaining after taken & pending
  @Prop({ default: 0 })
  remaining: number;

  @Prop()
  lastAccrualDate?: Date;

  @Prop()
  nextResetDate?: Date;
}

export const LeaveEntitlementSchema =
  SchemaFactory.createForClass(LeaveEntitlement);
