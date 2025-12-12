import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';

export class CreatePositionDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsMongoId()
    @IsNotEmpty()
    departmentId: string;

    @IsMongoId()
    @IsOptional()
    reportsToPositionId?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
