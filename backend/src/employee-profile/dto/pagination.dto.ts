import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (1-based)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 'firstName',
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort order (asc or desc)',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    example: 'john',
    description: 'Search term',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class EmployeeProfileResponseDto {
  @ApiProperty({
    example: '60d5ec49c1234567890abcd1',
    description: 'Employee ID',
  })
  _id: string;

  @ApiProperty({
    example: 'EMP001',
    description: 'Employee number',
  })
  employeeNumber: string;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Work email',
  })
  workEmail: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name',
  })
  fullName: string;

  @ApiProperty({
    example: '12345678901234',
    description: 'National ID',
  })
  nationalId: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Employee status',
  })
  status: string;

  @ApiProperty({
    example: '2020-01-15',
    description: 'Date of hire',
  })
  dateOfHire: Date;

  @ApiPropertyOptional({
    description: 'Primary position ID',
  })
  primaryPositionId?: string;

  @ApiPropertyOptional({
    description: 'Primary department ID',
  })
  primaryDepartmentId?: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Created at',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-16',
    description: 'Updated at',
  })
  updatedAt: Date;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Data items',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    example: 1,
    description: 'Current page',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Items per page',
  })
  limit: number;

  @ApiProperty({
    example: 100,
    description: 'Total items',
  })
  total: number;

  @ApiProperty({
    example: 10,
    description: 'Total pages',
  })
  pages: number;
}
