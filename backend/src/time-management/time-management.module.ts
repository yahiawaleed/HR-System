import { Module } from '@nestjs/common';
import { TimeManagementController } from './time-management.controller';
import { TimeManagementService } from './time-management.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationLogSchema, NotificationLog } from './models/notification-log.schema';
import { AttendanceCorrectionRequestSchema, AttendanceCorrectionRequest } from './models/attendance-correction-request.schema';
import { ShiftTypeSchema, ShiftType } from './models/shift-type.schema';
import { ScheduleRuleSchema, ScheduleRule } from './models/schedule-rule.schema';
import { AttendanceRecordSchema, AttendanceRecord } from './models/attendance-record.schema';
import { TimeExceptionSchema, TimeException } from './models/time-exception.schema';
import { OvertimeRuleSchema, OvertimeRule } from './models/overtime-rule.schema';
import { ShiftSchema, Shift } from './models/shift.schema';
import { ShiftAssignmentSchema, ShiftAssignment } from './models/shift-assignment.schema';
import { LatenessRule, latenessRuleSchema } from './models/lateness-rule.schema';
import { HolidaySchema, Holiday } from './models/holiday.schema';
import { SettingsSchema, Settings } from './models/settings.schema';

// Integration Services
import { PayrollIntegrationService } from './integrations/payroll-integration.service';
import { LeavesIntegrationService } from './integrations/leaves-integration.service';
import { OrgStructureIntegrationService } from './integrations/org-structure-integration.service';
import { NotificationIntegrationService } from './integrations/notification-integration.service';
import { PerformanceIntegrationService } from './integrations/performance-integration.service';

// Import EmployeeProfileModule for populate functionality
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    EmployeeProfileModule, // Required for populating employeeId references
    MongooseModule.forFeature([
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
      { name: ShiftType.name, schema: ShiftTypeSchema },
      { name: ScheduleRule.name, schema: ScheduleRuleSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: TimeException.name, schema: TimeExceptionSchema },
      { name: OvertimeRule.name, schema: OvertimeRuleSchema },
      { name: Shift.name, schema: ShiftSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: LatenessRule.name, schema: latenessRuleSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: Settings.name, schema: SettingsSchema },
    ]),
  ],
  controllers: [TimeManagementController],
  providers: [
    TimeManagementService,
    // Integration Services
    PayrollIntegrationService,
    LeavesIntegrationService,
    OrgStructureIntegrationService,
    NotificationIntegrationService,
    PerformanceIntegrationService,
  ],
  exports: [
    TimeManagementService,
    // Export integration services for use by other modules
    PayrollIntegrationService,
    LeavesIntegrationService,
    OrgStructureIntegrationService,
    NotificationIntegrationService,
    PerformanceIntegrationService,
  ],
})
export class TimeManagementModule {}
