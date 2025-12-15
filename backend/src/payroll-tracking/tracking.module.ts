import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { payrollTrackingModels } from './schemas';
import { PayrollTrackingService } from './services/payroll-tracking.service';
import { PayrollTrackingController } from './controllers/payroll-tracking.controller';
import { PayslipService } from './services/payslip.service';
import { ClaimService } from './services/claim.service';
import { DisputeService } from './services/dispute.service';
import { PayslipController } from './controllers/payslip.controller';
import { ClaimController } from './controllers/claim.controller';
import { DisputeController } from './controllers/dispute.controller';

@Module({
  imports: [
    MongooseModule.forFeature(payrollTrackingModels),
  ],
  controllers: [
    PayrollTrackingController,
    PayslipController,
    ClaimController,
    DisputeController,
  ],
  providers: [
    PayrollTrackingService,
    PayslipService,
    ClaimService,
    DisputeService,
  ],
  exports: [PayrollTrackingService, PayslipService, ClaimService, DisputeService],
})
export class PayrollTrackingModule {}