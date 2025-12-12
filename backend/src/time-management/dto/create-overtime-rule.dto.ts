import { IsString, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOvertimeRuleDto {
  @ApiProperty({ example: 'OT-001', description: 'Unique code for the overtime rule' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Standard Overtime', description: 'Name of the overtime rule' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Standard overtime policy for regular employees', description: 'Description of the rule', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 480, description: 'Minutes worked before overtime starts (default 480 = 8 hours)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minMinutesBeforeOvertime?: number;

  @ApiProperty({ example: 1.5, description: 'Overtime multiplier for weekdays', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  weekdayMultiplier?: number;

  @ApiProperty({ example: 2.0, description: 'Overtime multiplier for weekends', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  weekendMultiplier?: number;

  @ApiProperty({ example: 2.5, description: 'Overtime multiplier for holidays', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  holidayMultiplier?: number;

  @ApiProperty({ example: 1.25, description: 'Additional multiplier for night shifts', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  nightShiftMultiplier?: number;

  @ApiProperty({ example: 240, description: 'Maximum overtime minutes per day (0 = unlimited)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxOvertimeMinutesPerDay?: number;

  @ApiProperty({ example: 1200, description: 'Maximum overtime minutes per week (0 = unlimited)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxOvertimeMinutesPerWeek?: number;

  @ApiProperty({ example: 4800, description: 'Maximum overtime minutes per month (0 = unlimited)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxOvertimeMinutesPerMonth?: number;

  @ApiProperty({ example: false, description: 'Whether overtime requires pre-approval', required: false })
  @IsBoolean()
  @IsOptional()
  requiresPreApproval?: boolean;

  @ApiProperty({ example: true, description: 'Whether the rule is active', required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ example: false, description: 'Whether the rule is approved for use', required: false })
  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}
