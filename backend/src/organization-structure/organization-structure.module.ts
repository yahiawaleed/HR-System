import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentService } from './services/department.service';
import { PositionService } from './services/position.service';
import { DepartmentController } from './controllers/department.controller';
import { PositionController } from './controllers/position.controller';
import { DepartmentSchema } from './schemas/department.schema';
import { PositionSchema } from './schemas/position.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Department', schema: DepartmentSchema },
      { name: 'Position', schema: PositionSchema },
    ]),
  ],
  controllers: [DepartmentController, PositionController],
  providers: [DepartmentService, PositionService],
  exports: [DepartmentService, PositionService],
})
export class OrganizationStructureModule {}

