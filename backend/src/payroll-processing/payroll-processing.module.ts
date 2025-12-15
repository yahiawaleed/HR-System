import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollProcessingService } from './services/payroll-processing.service';
import { PayrollProcessingController } from './controllers/payroll-processing.controller';
import { PayrollSchema } from '../payroll-tracking/schemas/payroll.schema';
import { PayslipSchema } from '../payroll-tracking/schemas/payslip.schema';
import { EmployeeSchema } from '../employee-profile/schemas/employee.schema';
import { PayGradeSchema } from '../payroll-configuration/schemas/pay-grade.schema';
import { AttendanceSchema } from '../time-management/schemas/attendance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Payroll', schema: PayrollSchema },
      { name: 'Payslip', schema: PayslipSchema },
      { name: 'Employee', schema: EmployeeSchema },
      { name: 'PayGrade', schema: PayGradeSchema },
      { name: 'Attendance', schema: AttendanceSchema },
    ]),
  ],
  controllers: [PayrollProcessingController],
  providers: [PayrollProcessingService],
  exports: [PayrollProcessingService],
})
export class PayrollProcessingModule {}

