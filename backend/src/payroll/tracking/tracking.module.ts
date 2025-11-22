import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { Payslip, PayslipSchema } from './schemas/payslip.schema';
import { Claim, ClaimSchema } from './schemas/claim.schema';
import { Dispute, DisputeSchema } from './schemas/dispute.schema';
import { PayrollConfigurationModule, PayrollProcessingModule } from './mocks/mock-payroll.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payslip.name, schema: PayslipSchema },
      { name: Claim.name, schema: ClaimSchema },
      { name: Dispute.name, schema: DisputeSchema },
    ]),
    // other subsystems
    PayrollConfigurationModule, 
    PayrollProcessingModule
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService], // service exports
})
export class TrackingModule {}