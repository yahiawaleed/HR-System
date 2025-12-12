import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StructureRequestType } from '../enums/organization-structure.enums';

export class CreateChangeRequestDto {
    @IsString()
    @IsOptional()
    requestNumber?: string;

    @IsMongoId()
    @IsOptional()
    requestedByEmployeeId?: string;

    @IsEnum(StructureRequestType)
    @IsNotEmpty()
    requestType: StructureRequestType;

    @IsMongoId()
    @IsOptional()
    targetDepartmentId?: string;

    @IsMongoId()
    @IsOptional()
    targetPositionId?: string;

    @IsString()
    @IsOptional()
    details?: string;

    @IsString()
    @IsOptional()
    reason?: string;
}
