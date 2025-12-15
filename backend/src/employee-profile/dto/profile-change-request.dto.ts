import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateProfileChangeRequestDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  fieldName: string;

  @IsNotEmpty()
  newValue: any;

  @IsOptional()
  oldValue?: any;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewChangeRequestDto {
  @IsNotEmpty()
  @IsEnum(['approved', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

