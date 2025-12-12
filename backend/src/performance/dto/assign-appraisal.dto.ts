import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignAppraisalDto {
    @IsMongoId()
    @IsNotEmpty()
    cycleId: string;

    @IsMongoId()
    @IsNotEmpty()
    templateId: string;

    @IsMongoId()
    @IsNotEmpty()
    employeeProfileId: string;

    @IsMongoId()
    @IsNotEmpty()
    managerProfileId: string;

    @IsMongoId()
    @IsNotEmpty()
    departmentId: string;

    @IsMongoId()
    @IsOptional()
    positionId?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;
}
