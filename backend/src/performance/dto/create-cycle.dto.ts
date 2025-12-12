import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppraisalTemplateType } from '../enums/performance.enums';

export class CycleTemplateAssignmentDto {
    @IsString()
    @IsNotEmpty()
    templateId: string;

    @IsArray()
    @IsOptional()
    departmentIds?: string[];
}

export class CreateCycleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(AppraisalTemplateType)
    @IsNotEmpty()
    cycleType: AppraisalTemplateType;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsDateString()
    @IsOptional()
    managerDueDate?: string;

    @IsDateString()
    @IsOptional()
    employeeAcknowledgementDueDate?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CycleTemplateAssignmentDto)
    @IsOptional()
    templateAssignments?: CycleTemplateAssignmentDto[];
}
