import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeService } from './services/employee.service';
import { ProfileChangeRequestService } from './services/profile-change-request.service';
import { EmployeeController } from './controllers/employee.controller';
import { ProfileChangeRequestController } from './controllers/profile-change-request.controller';
import { EmployeeSchema } from './schemas/employee.schema';
import { ProfileChangeRequestSchema } from './schemas/profile-change-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Employee', schema: EmployeeSchema },
      { name: 'ProfileChangeRequest', schema: ProfileChangeRequestSchema },
    ]),
  ],
  controllers: [EmployeeController, ProfileChangeRequestController],
  providers: [EmployeeService, ProfileChangeRequestService],
  exports: [EmployeeService, ProfileChangeRequestService],
})
export class EmployeeProfileModule {}

