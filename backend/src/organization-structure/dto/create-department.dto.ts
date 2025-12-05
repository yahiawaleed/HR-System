import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentDepartmentId?: string;

  @IsOptional()
  @IsString()
  headId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

