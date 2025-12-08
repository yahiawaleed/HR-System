import { IsNotEmpty, IsDate, IsString, IsOptional, IsMongoId, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeaveRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  fromDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  toDate: Date;

  @IsString()
  @IsOptional()
  justification?: string;

  @IsMongoId()
  @IsOptional()
  attachmentId?: string;

  @IsNumber()
  @Min(0.5)
  durationDays: number;
}