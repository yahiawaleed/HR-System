import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { CreateHolidayDto } from './create-holiday.dto';
import { HolidayType } from '../models/enums';

export class UpdateHolidayDto extends PartialType(CreateHolidayDto) {
    @ApiProperty({ enum: HolidayType, example: HolidayType.NATIONAL, description: 'Type of holiday', required: false })
    @IsEnum(HolidayType)
    @IsOptional()
    type?: HolidayType;

    @ApiProperty({ example: '2025-12-25T00:00:00Z', description: 'Start date of the holiday', required: false })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ example: '2025-12-26T00:00:00Z', description: 'End date of the holiday', required: false })
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiProperty({ example: 'Christmas Day', description: 'Name of the holiday', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: true, description: 'Whether the holiday is active', required: false })
    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
