import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({
    example: '5000',
    type: 'number',
    format: 'number',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'usd',
    type: 'string',
    format: 'string',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    example: 'pm_card_visa',
    type: 'string',
    format: 'string',
  })
  @IsString()
  paymentMethod: string;
}

export class VerifyPaymentDto {
  @ApiProperty({
    example: '',
    type: 'string',
    format: 'string',
  })
  @IsString()
  payment_id: string;
}

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsString()
  payment_id: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  status?: string;
}
