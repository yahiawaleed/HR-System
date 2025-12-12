import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';

export class CreateChangeRequestDto {
  @ApiProperty({
    example: 'Request to update job title from Manager to Senior Manager',
    description: 'Description of the change request',
  })
  @IsString()
  requestDescription: string;

  @ApiPropertyOptional({
    example: 'Career growth and increased responsibilities',
    description: 'Reason for the change',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateChangeRequestStatusDto {
  @ApiProperty({
    example: 'APPROVED',
    enum: ProfileChangeStatus,
    description: 'New status (APPROVED or REJECTED)',
  })
  @IsEnum(ProfileChangeStatus)
  status: ProfileChangeStatus;

  @ApiPropertyOptional({
    example: 'Approved by HR Manager John Doe',
    description: 'Admin notes',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class ChangeRequestQueryDto {
  @ApiPropertyOptional({
    example: 'PENDING',
    enum: ProfileChangeStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(ProfileChangeStatus)
  status?: ProfileChangeStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (1-based)',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
  })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class ChangeRequestResponseDto {
  @ApiProperty({
    example: '60d5ec49c1234567890abcd1',
    description: 'Change request ID',
  })
  _id: string;

  @ApiProperty({
    example: '60d5ec49c1234567890abcd2',
    description: 'Employee profile ID',
  })
  employeeProfileId: string;

  @ApiProperty({
    example: 'REQ-001',
    description: 'Request ID',
  })
  requestId: string;

  @ApiProperty({
    example: 'Request to update job title',
    description: 'Request description',
  })
  requestDescription: string;

  @ApiPropertyOptional({
    example: 'Career growth',
    description: 'Reason',
  })
  reason?: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Status',
  })
  status: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Submitted at',
  })
  submittedAt: Date;

  @ApiPropertyOptional({
    example: '2024-01-16',
    description: 'Processed at',
  })
  processedAt?: Date;
}
