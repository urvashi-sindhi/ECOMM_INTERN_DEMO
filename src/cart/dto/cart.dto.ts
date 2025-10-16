import { IsNumber, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CartItemDto {
  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  product_variant_id: number;

  @ApiProperty({
    example: 2,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateCartDto {
  @ApiProperty({ type: [CartItemDto], required: true })
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cart_items: CartItemDto[];
}
