import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppraisalRatingScaleType, AppraisalTemplateType } from '../enums/performance.enums';

export class RatingScaleDefinitionDto {
    @IsEnum(AppraisalRatingScaleType)
    @IsNotEmpty()
    type: AppraisalRatingScaleType;

    @IsNotEmpty()
    min: number;

    @IsNotEmpty()
    max: number;

    @IsOptional()
    step?: number;

    @IsArray()
    @IsOptional()
    labels?: string[];
}

export class EvaluationCriterionDto {
    @IsString()
    @IsNotEmpty()
    key: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    details?: string;

    @IsOptional()
    weight?: number;

    @IsOptional()
    maxScore?: number;

    @IsBoolean()
    @IsOptional()
    required?: boolean;
}

export class TemplateSectionDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNotEmpty()
    weight: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EvaluationCriterionDto)
    criteria: EvaluationCriterionDto[];
}

export class CreateTemplateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(AppraisalTemplateType)
    @IsNotEmpty()
    templateType: AppraisalTemplateType;

    @ValidateNested()
    @Type(() => RatingScaleDefinitionDto)
    @IsNotEmpty()
    ratingScale: RatingScaleDefinitionDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TemplateSectionDto)
    @IsNotEmpty()
    sections: TemplateSectionDto[];

    @IsString()
    @IsOptional()
    instructions?: string;

    @IsArray()
    @IsOptional()
    applicableDepartmentIds?: string[];

    @IsArray()
    @IsOptional()
    applicablePositionIds?: string[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
