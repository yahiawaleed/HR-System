import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOvertimeRuleDto {
  @ApiProperty({ example: 'Weekend Overtime', description: 'Name of the overtime rule' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Overtime policy for weekend work', description: 'Description of the rule', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: true, description: 'Whether the rule is active', required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ example: false, description: 'Whether the rule is approved', required: false })
  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}
