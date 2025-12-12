import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus, ContractType, WorkType, Gender, MaritalStatus } from '../enums/employee-profile.enums';

export class EmployeeProfileResponseDto {
  @ApiProperty({
    example: '60d5ec49c1234567890abcd1',
    description: 'Employee ID',
  })
  _id: string;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Work email',
  })
  workEmail: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  lastName: string;

  @ApiPropertyOptional({
    example: 'Michael',
    description: 'Middle name',
  })
  middleName?: string;

  @ApiProperty({
    example: 'John Michael Doe',
    description: 'Full name',
  })
  fullName: string;

  @ApiProperty({
    example: 'EMP001',
    description: 'Employee number',
  })
  employeeNumber: string;

  @ApiProperty({
    example: '12345678901234',
    description: 'National ID',
  })
  nationalId: string;

  @ApiPropertyOptional({
    example: '1990-01-15',
    description: 'Date of birth',
  })
  dateOfBirth?: Date;

  @ApiProperty({
    example: '2020-01-15',
    description: 'Date of hire',
  })
  dateOfHire: Date;

  @ApiPropertyOptional({
    example: 'MALE',
    enum: Gender,
    description: 'Gender',
  })
  gender?: Gender;

  @ApiPropertyOptional({
    example: 'SINGLE',
    enum: MaritalStatus,
    description: 'Marital status',
  })
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Mobile phone',
  })
  mobilePhone?: string;

  @ApiPropertyOptional({
    example: '+1234567891',
    description: 'Home phone',
  })
  homePhone?: string;

  @ApiPropertyOptional({
    example: 'john.doe@personal.com',
    description: 'Personal email',
  })
  personalEmail?: string;

  @ApiProperty({
    example: 'ACTIVE',
    enum: EmployeeStatus,
    description: 'Employee status',
  })
  status: EmployeeStatus;

  @ApiPropertyOptional({
    example: 'FULL_TIME_CONTRACT',
    enum: ContractType,
    description: 'Contract type',
  })
  contractType?: ContractType;

  @ApiPropertyOptional({
    example: 'FULL_TIME',
    enum: WorkType,
    description: 'Work type',
  })
  workType?: WorkType;

  @ApiPropertyOptional({
    example: '2020-01-15',
    description: 'Contract start date',
  })
  contractStartDate?: Date;

  @ApiPropertyOptional({
    example: '2025-01-15',
    description: 'Contract end date',
  })
  contractEndDate?: Date;

  @ApiPropertyOptional({
    example: 'Bank Name',
    description: 'Bank name',
  })
  bankName?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Bank account number',
  })
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    example: 'A passionate professional...',
    description: 'Biography',
  })
  biography?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
  })
  profilePictureUrl?: string;

  @ApiPropertyOptional({
    description: 'Timestamp when created',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when updated',
  })
  updatedAt?: Date;
}
