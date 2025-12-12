import { IsString, IsBoolean, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, Matches, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enum for shift type category
export enum ShiftTypeCategory {
  NORMAL = 'NORMAL',
  SPLIT = 'SPLIT',
  OVERNIGHT = 'OVERNIGHT',
  ROTATIONAL = 'ROTATIONAL',
  FLEXIBLE = 'FLEXIBLE',
}

// DTO for split parts
export class SplitPartDto {
  @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @ApiProperty({ example: '12:00', description: 'End time in HH:mm format' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:mm format' })
  endTime: string;
}

export class CreateShiftTypeDto {
  @ApiProperty({ example: 'DAY-001', description: 'Unique shift type code' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Normal Day Shift', description: 'Name of the shift type' })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'NORMAL', 
    description: 'Shift category type',
    enum: ShiftTypeCategory,
    required: false
  })
  @IsEnum(ShiftTypeCategory)
  @IsOptional()
  category?: ShiftTypeCategory;

  @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format', required: false })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  @IsOptional()
  startTime?: string;

  @ApiProperty({ example: '17:00', description: 'End time in HH:mm format', required: false })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:mm format' })
  @IsOptional()
  endTime?: string;

  @ApiProperty({ example: 480, description: 'Total work duration in minutes', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalDurationMinutes?: number;

  @ApiProperty({ example: 60, description: 'Total break time in minutes', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  breakDurationMinutes?: number;

  @ApiProperty({ 
    type: [SplitPartDto], 
    description: 'Split shift work periods (for SPLIT category)',
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitPartDto)
  @IsOptional()
  splitParts?: SplitPartDto[];

  @ApiProperty({ example: false, description: 'Is this a night shift?', required: false })
  @IsBoolean()
  @IsOptional()
  isNightShift?: boolean;

  @ApiProperty({ example: false, description: 'Is this a weekend shift?', required: false })
  @IsBoolean()
  @IsOptional()
  isWeekendShift?: boolean;

  @ApiProperty({ example: 15, description: 'Grace period for late arrival (minutes)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  graceMinutesIn?: number;

  @ApiProperty({ example: 10, description: 'Grace period for early departure (minutes)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  graceMinutesOut?: number;

  @ApiProperty({ example: 'Standard 9-5 weekday shift', description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: true, description: 'Whether the shift type is active', required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
