import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { CandidateStatus } from '../enums/employee-profile.enums';

export class CreateCandidateDto {
  @ApiProperty({
    example: 'candidate@email.com',
    description: 'Personal email',
  })
  @IsEmail()
  personalEmail: string;

  @ApiProperty({
    example: 'Jane',
    description: 'First name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Smith',
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
    example: '12345678901234',
    description: 'National ID',
  })
  @IsString()
  nationalId: string;

  @ApiPropertyOptional({
    example: '1995-05-20',
    description: 'Date of birth',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'Job position ID they applied for',
  })
  @IsOptional()
  @IsString()
  positionId?: string;

  @ApiPropertyOptional({
    example: 'APPLIED',
    enum: CandidateStatus,
    description: 'Initial candidate status',
  })
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;
}

export class UpdateCandidateStatusDto {
  @ApiProperty({
    example: 'INTERVIEW',
    enum: CandidateStatus,
    description: 'New candidate status',
  })
  @IsEnum(CandidateStatus)
  status: CandidateStatus;

  @ApiPropertyOptional({
    example: 'Passed initial screening',
    description: 'Status change reason/notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConvertCandidateToEmployeeDto {
  @ApiProperty({
    example: 'EMP001',
    description: 'New employee number',
  })
  @IsString()
  employeeNumber: string;

  @ApiProperty({
    example: 'john.candidate@company.com',
    description: 'Work email',
  })
  @IsEmail()
  workEmail: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Initial password',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'Position ID to assign',
  })
  @IsOptional()
  @IsString()
  primaryPositionId?: string;

  @ApiPropertyOptional({
    description: 'Department ID to assign',
  })
  @IsOptional()
  @IsString()
  primaryDepartmentId?: string;

  @ApiPropertyOptional({
    description: 'Pay grade ID',
  })
  @IsOptional()
  @IsString()
  payGradeId?: string;
}

export class CandidateResponseDto {
  @ApiProperty({
    example: '60d5ec49c1234567890abcd1',
    description: 'Candidate ID',
  })
  _id: string;

  @ApiProperty({
    example: 'Jane Smith',
    description: 'Full name',
  })
  fullName: string;

  @ApiProperty({
    example: 'candidate@email.com',
    description: 'Email',
  })
  personalEmail: string;

  @ApiProperty({
    example: 'APPLIED',
    description: 'Candidate status',
  })
  status: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Creation date',
  })
  createdAt: Date;
}
