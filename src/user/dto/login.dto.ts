import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john@example.com',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email should be in correct format.' })
  email: string;

  @ApiProperty({
    example: 'Password@123',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message:
      'Password must contain at least one uppercase letter, one number, and one special character',
  })
  password: string;
}
