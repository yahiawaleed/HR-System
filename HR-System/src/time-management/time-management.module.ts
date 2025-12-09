// ============================================
// 📦 TIME MANAGEMENT MODULE - FEATURE MODULE
// ============================================
// This module handles all time management features:
// - Attendance tracking
// - Shifts and schedules
// - Holidays
// - Overtime rules
// - Lateness tracking
// ============================================

import { Module } from '@nestjs/common';
import { TimeManagementController } from './time-management.controller';  // Routes are defined here
import { TimeManagementService } from './time-management.service';        // Functions are written here
import { MongooseModule } from '@nestjs/mongoose';                       // For MongoDB connection

// Import all database schemas (models) - These define the structure of MongoDB collections
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

// @Module decorator - defines this class as a NestJS module
@Module({
  // ============================================
  // imports: Register database models for this module
  // ============================================
  // MongooseModule.forFeature() registers schemas for this specific module
  // Each schema becomes a MongoDB collection that you can query in your service
  imports: [MongooseModule.forFeature([
    // Syntax: { name: ModelName.name, schema: ModelSchema }
    // MongoDB will create collections named: notificationlogs, attendancerecords, shifts, etc.
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
  ])],
  
  // ============================================
  // controllers: Define API routes/endpoints
  // ============================================
  // Controllers handle HTTP requests (GET, POST, PUT, DELETE)
  // Routes are defined in time-management.controller.ts
  controllers: [TimeManagementController],
  
  // ============================================
  // providers: Services with business logic
  // ============================================
  // Services contain functions that interact with the database
  // Functions are written in time-management.service.ts
  providers: [TimeManagementService]
})
export class TimeManagementModule {}
