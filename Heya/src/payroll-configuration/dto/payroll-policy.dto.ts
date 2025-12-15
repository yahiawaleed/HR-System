// src/payroll-configuration/dto/payroll-policy.dto.ts
import { IsBoolean, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { PolicyType, Applicability } from '../enums/payroll-configuration-enums';

export class CreatePayrollPolicyDto {
  @IsString()
  name: string;

  @IsString()
  type: PolicyType;

  @IsString()
  applicability: Applicability;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAmount?: number;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdatePayrollPolicyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: PolicyType;

  @IsOptional()
  @IsString()
  applicability?: Applicability;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAmount?: number;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;
}
