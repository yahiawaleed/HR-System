import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import {
  AppraisalTemplate,
  AppraisalTemplateSchema,
} from './models/appraisal-template.schema';
import {
  AppraisalCycle,
  AppraisalCycleSchema,
} from './models/appraisal-cycle.schema';
import {
  AppraisalAssignment,
  AppraisalAssignmentSchema,
} from './models/appraisal-assignment.schema';
import {
  AppraisalRecord,
  AppraisalRecordSchema,
} from './models/appraisal-record.schema';
import {
  AppraisalDispute,
  AppraisalDisputeSchema,
} from './models/appraisal-dispute.schema';
import { EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { DepartmentSchema } from '../organization-structure/models/department.schema';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppraisalTemplate.name, schema: AppraisalTemplateSchema },
      { name: AppraisalCycle.name, schema: AppraisalCycleSchema },
      { name: AppraisalAssignment.name, schema: AppraisalAssignmentSchema },
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      { name: AppraisalDispute.name, schema: AppraisalDisputeSchema },
      { name: 'EmployeeProfile', schema: EmployeeProfileSchema },
      { name: 'Department', schema: DepartmentSchema },
    ]),
    NotificationModule,
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule { }
