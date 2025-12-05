import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsArray, Min } from 'class-validator';

export class AttachmentDto {
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}

export class CreateClaimDto {
  @IsNotEmpty()
  @IsString()
  payrollId: string;

  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsEnum(['expense', 'allowance', 'reimbursement', 'other'])
  type: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  attachments?: AttachmentDto[];
}

