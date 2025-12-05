import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateDisputeDto {
  @IsNotEmpty()
  @IsString()
  payrollId: string;

  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsEnum(['open', 'review', 'resolved'])
  status?: string;
}

