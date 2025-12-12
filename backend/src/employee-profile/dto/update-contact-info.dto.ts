import { IsOptional, IsString, IsEmail, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContactInfoDto {
    @ApiPropertyOptional({ example: '+201234567890', description: 'Mobile phone number' })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Mobile phone must be a valid phone number format',
    })
    mobilePhone?: string;

    @ApiPropertyOptional({ example: '+20233456789', description: 'Home phone number' })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Home phone must be a valid phone number format',
    })
    homePhone?: string;

    @ApiPropertyOptional({ example: 'employee@personal.com', description: 'Personal email address' })
    @IsOptional()
    @IsEmail({}, { message: 'Personal email must be a valid email address' })
    personalEmail?: string;

    @ApiPropertyOptional({
        example: '123 Main Street, Apt 4B, Cairo, Egypt',
        description: 'Full address',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string;
}
