import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Length } from 'class-validator';

export class UpdateAddressDto {
  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  city_id: number;

  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  state_id: number;

  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  country_id: number;

  @ApiProperty({
    example: 'John Doe',
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    example: '7654565464',
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(10, 10)
  phone_number: string;

  @ApiProperty({
    example: 'd-501,shayona aagman',
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
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
    required: false,
  })
  @IsNumber()
  @IsOptional()
  postal_code: number;
}
