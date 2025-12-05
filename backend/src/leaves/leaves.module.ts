import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveService } from './services/leave.service';
import { LeaveController } from './controllers/leave.controller';
import { LeaveTypeSchema } from './schemas/leave-type.schema';
import { LeaveEntitlementSchema } from './schemas/leave-entitlement.schema';
import { LeaveRequestSchema } from './schemas/leave-request.schema';
import { LeavePolicySchema } from './schemas/leave-policy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'LeaveType', schema: LeaveTypeSchema },
      { name: 'LeaveEntitlement', schema: LeaveEntitlementSchema },
      { name: 'LeaveRequest', schema: LeaveRequestSchema },
      { name: 'LeavePolicy', schema: LeavePolicySchema },
    ]),
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeavesModule {}

