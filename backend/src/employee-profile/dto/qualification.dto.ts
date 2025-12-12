import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { GraduationType } from '../enums/employee-profile.enums';

export class CreateQualificationDto {
  @ApiProperty({
    example: 'University of Example',
    description: 'Establishment name',
  })
  @IsString()
  establishmentName: string;

  @ApiProperty({
    example: 'BACHELOR',
    enum: GraduationType,
    description: 'Graduation type',
  })
  @IsEnum(GraduationType)
  graduationType: GraduationType;
}

export class QualificationResponseDto {
  @ApiProperty({
    example: '60d5ec49c1234567890abcd1',
    description: 'Qualification ID',
  })
  _id: string;

  @ApiProperty({
    example: '60d5ec49c1234567890abcd1',
    description: 'Employee profile ID',
  })
  employeeProfileId: string;

  @ApiProperty({
    example: 'University of Example',
    description: 'Establishment name',
  })
  establishmentName: string;

  @ApiProperty({
    example: 'BACHELOR',
    description: 'Graduation type',
  })
  graduationType: string;
}
