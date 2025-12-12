import { IsString, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLatenessRuleDto {
    @ApiProperty({ example: 'LR-001', description: 'Unique code for the lateness rule' })
    @IsString()
    code: string;

    @ApiProperty({ example: 'Standard Lateness Policy', description: 'Name of the lateness rule' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Default lateness policy for all employees', description: 'Description of the rule', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 15, description: 'Grace period in minutes before lateness is counted', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    gracePeriodMinutes?: number;

    @ApiProperty({ example: 0.5, description: 'Amount deducted for each minute of lateness', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    deductionPerMinute?: number;

    @ApiProperty({ example: false, description: 'Whether deduction is percentage-based', required: false })
    @IsBoolean()
    @IsOptional()
    isPercentage?: boolean;

    @ApiProperty({ example: 60, description: 'Maximum minutes to deduct for (0 = unlimited)', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    maxDeductionMinutes?: number;

    @ApiProperty({ example: 3, description: 'Number of late arrivals before warning', required: false })
    @IsNumber()
    @Min(1)
    @IsOptional()
    warningThreshold?: number;

    @ApiProperty({ example: 5, description: 'Number of late arrivals before escalation', required: false })
    @IsNumber()
    @Min(1)
    @IsOptional()
    escalationThreshold?: number;

    @ApiProperty({ example: 7, description: 'Number of days for rolling window threshold', required: false })
    @IsNumber()
    @Min(1)
    @IsOptional()
    periodDays?: number;

    @ApiProperty({ example: false, description: 'Whether to auto-deduct from payroll', required: false })
    @IsBoolean()
    @IsOptional()
    autoDeduct?: boolean;

    @ApiProperty({ example: true, description: 'Whether the rule is active', required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
