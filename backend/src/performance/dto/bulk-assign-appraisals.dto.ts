import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkAssignmentItem {
    @IsMongoId()
    @IsNotEmpty()
    employeeProfileId: string;

    @IsMongoId()
    @IsNotEmpty()
    managerProfileId: string;

    @IsMongoId()
    @IsOptional()
    positionId?: string;
}

export class BulkAssignAppraisalsDto {
    @IsMongoId()
    @IsNotEmpty()
    cycleId: string;

    @IsMongoId()
    @IsNotEmpty()
    templateId: string;

    @IsMongoId()
    @IsNotEmpty()
    departmentId: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkAssignmentItem)
    @IsNotEmpty()
    employees: BulkAssignmentItem[];
}
