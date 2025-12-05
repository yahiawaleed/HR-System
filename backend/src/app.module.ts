import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { PerformanceModule } from './performance/performance.module';
import { TimeManagementModule } from './time-management/time-management.module';
import { LeavesModule } from './leaves/leaves.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { PayrollConfigurationModule } from './payroll-configuration/payroll-configuration.module';
import { PayrollProcessingModule } from './payroll-processing/payroll-processing.module';
import { PayrollTrackingModule } from './payroll-tracking/tracking.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system'),
    AuthModule,
    EmployeeProfileModule,
    OrganizationStructureModule,
    PerformanceModule,
    TimeManagementModule,
    LeavesModule,
    RecruitmentModule,
    PayrollConfigurationModule,
    PayrollProcessingModule,
    PayrollTrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
