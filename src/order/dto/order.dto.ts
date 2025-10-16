import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMode } from 'src/libs/utility/constants/enums';

export class OrderDto {
  @ApiProperty({
    example: PaymentMode.ONLINE,
    enum: [PaymentMode.ONLINE, PaymentMode.COD],
  })
  @IsEnum({
    online: PaymentMode.ONLINE,
    cod: PaymentMode.COD,
  })
  payment_mode: string;

  @ApiProperty({
    example: 'pm_card_visa',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({
    example: '1',
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  cart_id: number;

  @ApiProperty({
    example: '1',
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  shipping_address_id: number;

  @ApiProperty({
    example: false,
    type: 'boolean',
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  billingSameAsShipping: boolean;

  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: false,
  })
  @ValidateIf((o) => o.billingSameAsShipping === false)
  @IsNotEmpty()
  @IsNumber()
  billing_address_id: number;
}
