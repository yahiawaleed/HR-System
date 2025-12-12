import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsDate, IsPhoneNumber, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeStatus, ContractType, WorkType, Gender, MaritalStatus } from '../enums/employee-profile.enums';
import { IsValidObjectIdConstraint } from '../../common/validators/is-valid-object-id.validator';

export class CreateEmployeeProfileDto {
  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Work email address',
  })
  @IsEmail()
  workEmail: string;

  @ApiProperty({
    example: 'john@company.com',
    description: 'Password for the employee account',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    example: 'Michael',
    description: 'Middle name',
  })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({
    example: 'EMP001',
    description: 'Unique employee number',
  })
  @IsString()
  employeeNumber: string;

  @ApiProperty({
    example: '12345678901234',
    description: 'National ID',
  })
  @IsString()
  nationalId: string;

  @ApiProperty({
    example: '1990-01-15',
    description: 'Date of birth',
  })
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @ApiProperty({
    example: '2020-01-15',
    description: 'Date of hire',
  })
  @Type(() => Date)
  @IsDate()
  dateOfHire: Date;

  @ApiPropertyOptional({
    example: 'MALE',
    enum: Gender,
    description: 'Gender',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: 'SINGLE',
    enum: MaritalStatus,
    description: 'Marital status',
  })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({
    example: '+201234567890',
    description: 'Mobile phone number',
  })
  @IsOptional()
  @IsPhoneNumber('EG')
  mobilePhone?: string;

  @ApiPropertyOptional({
    example: '+201234567891',
    description: 'Home phone number',
  })
  @IsOptional()
  @IsPhoneNumber('EG')
  homePhone?: string;

  @ApiPropertyOptional({
    example: 'john.doe@personal.com',
    description: 'Personal email address',
  })
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @ApiPropertyOptional({
    example: 'FULL_TIME_CONTRACT',
    enum: ContractType,
    description: 'Contract type',
  })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional({
    example: 'FULL_TIME',
    enum: WorkType,
    description: 'Work type',
  })
  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @ApiPropertyOptional({
    example: '2020-01-15',
    description: 'Contract start date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  contractStartDate?: Date;

  @ApiPropertyOptional({
    example: '2025-01-15',
    description: 'Contract end date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  contractEndDate?: Date;

  @ApiPropertyOptional({
    example: 'Bank Name',
    description: 'Bank name for salary',
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Bank account number',
  })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    example: 'A passionate professional...',
    description: 'Employee biography',
  })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiPropertyOptional({
    description: 'Primary position ID',
  })
  @IsOptional()
  @IsString()
  @Validate(IsValidObjectIdConstraint)
  primaryPositionId?: string;

  @ApiPropertyOptional({
    description: 'Primary department ID',
  })
  @IsOptional()
  @IsString()
  @Validate(IsValidObjectIdConstraint)
  primaryDepartmentId?: string;

  @ApiPropertyOptional({
    description: 'Pay grade ID',
  })
  @IsOptional()
  @IsString()
  @Validate(IsValidObjectIdConstraint)
  payGradeId?: string;
}
