import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';

// FIX: Ensure these paths point to ./schemas/filename
import { Payslip, PayslipSchema } from './schemas/payslip.schema';
import { Claim, ClaimSchema } from './schemas/claim.schema';
import { Dispute, DisputeSchema } from './schemas/dispute.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payslip.name, schema: PayslipSchema },
      { name: Claim.name, schema: ClaimSchema },
      { name: Dispute.name, schema: DisputeSchema },
    ]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}