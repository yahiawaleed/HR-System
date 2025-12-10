import { IsString, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLatenessRuleDto {
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
    deductionForEachMinute?: number;

    @ApiProperty({ example: true, description: 'Whether the rule is active', required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
