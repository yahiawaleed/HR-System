import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FeedbackCriterionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    managerRating: number;

    @IsString()
    @IsOptional()
    managerComment?: string;
}

export class FeedbackSectionDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FeedbackCriterionDto)
    criteria: FeedbackCriterionDto[];
}

export class SubmitFeedbackDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FeedbackSectionDto)
    @IsNotEmpty()
    sections: FeedbackSectionDto[];

    @IsString()
    @IsOptional()
    managerFeedback?: string;
}
