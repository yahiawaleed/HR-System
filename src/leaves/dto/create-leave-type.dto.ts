import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsMongoId, IsNumber, Min } from 'class-validator';
import { AttachmentType } from '../enums/attachment-type.enum';

export class CreateLeaveTypeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  paid: boolean = true;

  @IsBoolean()
  @IsOptional()
  deductible: boolean = true;

  @IsBoolean()
  @IsOptional()
  requiresAttachment: boolean = false;

  @IsOptional()
  attachmentType?: AttachmentType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minTenureMonths?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxDurationDays?: number;
}