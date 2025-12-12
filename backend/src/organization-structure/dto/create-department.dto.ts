import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsOptional()
  headPositionId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
