import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateEmployeeProfileDto } from './create-employee-profile.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { EmployeeStatus } from '../enums/employee-profile.enums';

export class UpdateEmployeeProfileDto extends PartialType(CreateEmployeeProfileDto) {
  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: EmployeeStatus,
    description: 'Employee status',
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
