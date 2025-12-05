import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum([
    'system_admin',
    'hr_manager',
    'hr_employee',
    'hr_admin',
    'payroll_manager',
    'payroll_specialist',
    'finance_staff',
    'legal_admin',
    'department_manager',
    'line_manager',
    'employee',
  ])
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsString()
  employeeId?: string;
}

