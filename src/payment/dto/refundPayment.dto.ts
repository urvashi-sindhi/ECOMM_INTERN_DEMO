import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RefundDto {
  @ApiProperty({
    example: '',
    type: 'string',
    format: 'string',
  })
  @IsString()
  payment_id: string;
  @ApiProperty({
    example: '5000',
    type: 'number',
    format: 'number',
  })
  @IsNumber()
  amount: number;
}
