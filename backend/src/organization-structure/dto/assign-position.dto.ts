import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignPositionDto {
    @IsMongoId()
    @IsNotEmpty()
    employeeProfileId: string;

    @IsMongoId()
    @IsNotEmpty()
    positionId: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
