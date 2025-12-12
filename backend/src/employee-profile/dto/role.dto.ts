import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional, IsEnum } from 'class-validator';
import { SystemRole } from '../enums/employee-profile.enums';

export class AssignRoleDto {
  @ApiProperty({
    example: ['HR Manager', 'Department Head'],
    description: 'Array of system roles to assign',
    enum: SystemRole,
    isArray: true,
  })
  @IsArray()
  @IsEnum(SystemRole, { each: true })
  roles: SystemRole[];

  @ApiPropertyOptional({
    example: ['read:employee', 'write:employee'],
    description: 'Array of permissions',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: ['HR Manager'],
    description: 'Array of system roles',
    enum: SystemRole,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(SystemRole, { each: true })
  roles?: SystemRole[];

  @ApiPropertyOptional({
    example: ['read:employee', 'write:employee'],
    description: 'Array of permissions',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class RoleResponseDto {
  @ApiProperty({
    example: '60d5ec49c1234567890abcd1',
    description: 'Role ID',
  })
  _id: string;

  @ApiProperty({
    example: '60d5ec49c1234567890abcd1',
    description: 'Employee profile ID',
  })
  employeeProfileId: string;

  @ApiProperty({
    example: ['HR Manager', 'Department Head'],
    description: 'System roles',
    isArray: true,
  })
  roles: string[];

  @ApiProperty({
    example: ['read:employee', 'write:employee'],
    description: 'Permissions',
    isArray: true,
  })
  permissions: string[];

  @ApiProperty({
    example: true,
    description: 'Is active',
  })
  isActive: boolean;
}
