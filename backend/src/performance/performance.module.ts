import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppraisalService } from './services/appraisal.service';
import { AppraisalController } from './controllers/appraisal.controller';
import { AppraisalTemplateSchema } from './schemas/appraisal-template.schema';
import { AppraisalCycleSchema } from './schemas/appraisal-cycle.schema';
import { AppraisalSchema } from './schemas/appraisal.schema';
import { AppraisalDisputeSchema } from './schemas/appraisal-dispute.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AppraisalTemplate', schema: AppraisalTemplateSchema },
      { name: 'AppraisalCycle', schema: AppraisalCycleSchema },
      { name: 'Appraisal', schema: AppraisalSchema },
      { name: 'AppraisalDispute', schema: AppraisalDisputeSchema },
    ]),
  ],
  controllers: [AppraisalController],
  providers: [AppraisalService],
  exports: [AppraisalService],
})
export class PerformanceModule {}

