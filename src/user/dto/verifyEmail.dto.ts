import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'john@example.com',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsEmail({}, { message: 'Email should be in correct format.' })
  @IsNotEmpty()
  email: string;
}
