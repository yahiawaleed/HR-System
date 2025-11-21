import { Module } from '@nestjs/common';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';

@Module({
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService],
})
export class EmployeeProfileModule {}
