import { IsNotEmpty, IsMongoId, IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';

export class CreateLeavePolicyDto {
  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsEnum(AccrualMethod)
  @IsNotEmpty()
  accrualMethod: AccrualMethod;

  @IsNumber()
  @Min(0)
  monthlyRate: number;

  @IsNumber()
  @Min(0)
  yearlyRate: number;

  @IsBoolean()
  @IsOptional()
  carryforwardAllowed: boolean = false;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCarryForward: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  expiryAfterMonths?: number;

  @IsEnum(RoundingRule)
  @IsOptional()
  roundingRule: RoundingRule = RoundingRule.NONE;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumDays: number = 0;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxConsecutiveDays?: number;
}