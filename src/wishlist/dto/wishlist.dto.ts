import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WishlistDto {
  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  product_variant_id: number;
}
