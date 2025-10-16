import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, Matches } from 'class-validator';
import { Match } from 'src/libs/utility/constants/match.decorator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'john@example.com',
    type: 'string',
    format: 'email',
    required: true,
  })
  @IsEmail({}, { message: 'Email should be in correct format.' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password@123',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'Password@123',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/, {
    message:
      'Password must contain one capital latter and at least 8 character long',
  })
  newPassword: string;

  @ApiProperty({
    example: 'Password@123',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @Match('newPassword', { message: 'Your confirm Password is not match.' })
  @IsNotEmpty()
  confirmPassword: string;
}
