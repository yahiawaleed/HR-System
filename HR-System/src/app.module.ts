// ============================================
// 📦 ROOT MODULE - THE MAIN MODULE OF YOUR APPLICATION
// ============================================
// This module connects all feature modules together and sets up MongoDB connection

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import ConfigModule to read .env file
import { ConfigModule } from '@nestjs/config';

// Import MongooseModule to connect to MongoDB
import { MongooseModule } from '@nestjs/mongoose';

// Import all feature modules (each feature is a separate module)
import { TimeManagementModule } from './time-management/time-management.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { LeavesModule } from './leaves/leaves.module';
import { PayrollTrackingModule } from './payroll-tracking/payroll-tracking.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { PerformanceModule } from './performance/performance.module';
import { PayrollConfigurationModule } from './payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from './payroll-execution/payroll-execution.module';

// ============================================
// 🔌 MONGODB CONNECTION
// ============================================
// The connection string is stored in .env file for security
// Never commit passwords directly in code!
// The .env file contains: MONGODB_URI=mongodb+srv://...
// ============================================

// @Module decorator defines this class as a NestJS module
@Module({
  // imports: List of modules that this module depends on
  // Each module (TimeManagementModule, etc.) has its own controllers, services, and database models
  imports: [
    // ============================================
    // ConfigModule - Loads environment variables from .env file
    // ============================================
    // isGlobal: true makes env variables available in all modules
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ============================================
    // MongooseModule - Connects to MongoDB Atlas
    // ============================================
    // The connection string is read from .env file: process.env.MONGODB_URI
    // This keeps your password secret and not in the code
    // The '!' tells TypeScript that this value will definitely exist
    MongooseModule.forRoot(process.env.MONGODB_URI!),

    // Feature Modules
    TimeManagementModule,      // Handles attendance, shifts, holidays, etc.
    RecruitmentModule,         // Handles recruitment features
    LeavesModule,              // Handles employee leaves
    PayrollExecutionModule,    // Handles payroll execution
    PayrollConfigurationModule,// Handles payroll configuration
    PayrollTrackingModule,     // Handles payroll tracking
    EmployeeProfileModule,     // Handles employee profiles
    OrganizationStructureModule,// Handles organization structure
    PerformanceModule          // Handles performance reviews
  ],
  
  // controllers: HTTP route handlers for this module
  controllers: [AppController],
  
  // providers: Services (business logic) for this module
  providers: [AppService],
})
export class AppModule {}
