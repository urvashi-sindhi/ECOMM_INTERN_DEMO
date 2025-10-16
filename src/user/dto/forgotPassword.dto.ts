import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsInt,
  IsString,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Match } from 'src/libs/utility/constants/match.decorator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: '123123',
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(100000)
  @Max(999999)
  otp: number;

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
  @Match('newPassword', {
    message: 'New password and confirm password must be same.',
  })
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    example: 'john@example.com',
    type: 'string',
    format: 'email',
    required: true,
  })
  @IsEmail({}, { message: 'Email should be in correct format.' })
  @IsNotEmpty()
  email: string;
}
