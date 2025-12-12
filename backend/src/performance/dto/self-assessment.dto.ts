import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SelfAssessmentDto {
    @IsString()
    @IsNotEmpty() // Making strengths mandatory as an example, or could be optional
    strengths: string;

    @IsString()
    @IsOptional()
    weaknesses?: string;

    @IsString()
    @IsOptional()
    achievements?: string;

    @IsString()
    @IsOptional()
    goals?: string;
}
