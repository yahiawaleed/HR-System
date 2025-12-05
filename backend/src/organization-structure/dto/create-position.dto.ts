import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePositionDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsOptional()
  @IsString()
  reportsToPositionId?: string;

  @IsOptional()
  @IsString()
  payGradeId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

