import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: '60d5ec49c1234567890abcd1',
    description: 'User ID',
  })
  userId: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User full name',
  })
  fullName: string;

  @ApiProperty({
    example: 'HR Manager',
    description: 'User role',
  })
  role: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user needs to change their password',
  })
  isTemporaryPassword?: boolean;
}
