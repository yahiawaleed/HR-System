import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShiftService } from './services/shift.service';
import { AttendanceService } from './services/attendance.service';
import { ShiftController } from './controllers/shift.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { ShiftSchema } from './schemas/shift.schema';
import { EmployeeShiftSchema } from './schemas/employee-shift.schema';
import { AttendanceSchema } from './schemas/attendance.schema';
import { AttendanceCorrectionRequestSchema } from './schemas/attendance-correction-request.schema';
import { OvertimeRequestSchema } from './schemas/overtime-request.schema';
import { TimePolicySchema } from './schemas/time-policy.schema';
import { HolidayCalendarSchema } from './schemas/holiday-calendar.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Shift', schema: ShiftSchema },
      { name: 'EmployeeShift', schema: EmployeeShiftSchema },
      { name: 'Attendance', schema: AttendanceSchema },
      { name: 'AttendanceCorrectionRequest', schema: AttendanceCorrectionRequestSchema },
      { name: 'OvertimeRequest', schema: OvertimeRequestSchema },
      { name: 'TimePolicy', schema: TimePolicySchema },
      { name: 'HolidayCalendar', schema: HolidayCalendarSchema },
    ]),
  ],
  controllers: [ShiftController, AttendanceController],
  providers: [ShiftService, AttendanceService],
  exports: [ShiftService, AttendanceService],
})
export class TimeManagementModule {}

