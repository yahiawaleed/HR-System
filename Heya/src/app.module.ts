// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import your subsystem modules
import { TimeManagementModule } from './time-management/time-management.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { LeavesModule } from './leaves/leaves.module';
import { PayrollTrackingModule } from './payroll-tracking/payroll-tracking.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { PerformanceModule } from './performance/performance.module';
import { PayrollConfigurationModule } from './payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from './payroll-execution/payroll-execution.module';

@Module({
  imports: [
    // Global MongoDB connection
    MongooseModule.forRoot('mongodb://localhost:27017/hr-system'),

    // All feature modules
    TimeManagementModule,
    RecruitmentModule,
    LeavesModule,
    PayrollTrackingModule,
    EmployeeProfileModule,
    OrganizationStructureModule,
    PerformanceModule,
    PayrollConfigurationModule,
    PayrollExecutionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
