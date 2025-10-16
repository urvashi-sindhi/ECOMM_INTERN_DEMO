import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Length,
} from 'class-validator';

export class AddAddressDto {
  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  city_id: number;

  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  state_id: number;

  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  country_id: number;

  @ApiProperty({
    example: 'John Doe',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '7654565464',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  phone_number: string;

  @ApiProperty({
    example: 'd-501,shayona aagman',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  address_line1: string;

  @ApiProperty({
    example: 'vandematram,gota,ahmedabad',
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  address_line2?: string;

  @ApiProperty({
    example: 307022,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  postal_code: number;
}
