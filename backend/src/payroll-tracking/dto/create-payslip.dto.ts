import { IsNotEmpty, IsNumber, IsString, IsDate, IsOptional, IsBoolean, IsObject, IsArray, Min } from 'class-validator';

export class DeductionDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}

export class TaxBreakdownDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  federal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  state?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  socialSecurity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  medicare?: number;
}

export class CreatePayslipDto {
  @IsNotEmpty()
  @IsString()
  payrollId: string;

  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsDate()
  periodStart: Date;

  @IsNotEmpty()
  @IsDate()
  periodEnd: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  grossPay: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  netPay: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimePay?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonusPay?: number;

  @IsOptional()
  @IsObject()
  taxBreakdown?: TaxBreakdownDto;

  @IsOptional()
  @IsArray()
  deductions?: DeductionDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  finalized?: boolean;
}

