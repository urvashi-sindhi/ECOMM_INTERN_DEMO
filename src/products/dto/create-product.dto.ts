import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class VariantImageDto {
  @ApiProperty({ example: 'xyz.png' })
  @IsString()
  @IsNotEmpty()
  image_path: string;
}

class ProductVariantDto {
  @ApiProperty({
    example: 'i-phone 15 pro',
    description: 'Name of the category',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  product_title_name: string;

  @ApiProperty({
    example: 'Latest Apple smartphone',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Space Gray',
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    example: '128GB',
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({
    example: 999,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 100,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ type: VariantImageDto, required: true })
  @ValidateNested()
  @Type(() => VariantImageDto)
  variant_image: VariantImageDto;
}

export class CreateProductDto {
  @ApiProperty({
    example: 'Smartphone',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @ApiProperty({ type: [ProductVariantDto] })
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  product_variants: ProductVariantDto[];
}

export class ProductListDto {
  @ApiProperty({
    required: false,
    example: 1,
    type: 'number',
    format: 'integer',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({
    required: false,
    example: 10,
    type: 'number',
    format: 'integer',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @ApiProperty({
    required: false,
    example: 'id',
    type: 'string',
    enum: ['id', 'name'],
  })
  @IsOptional()
  @IsString()
  sortKey?: string;

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
    type: 'string',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortValue?: string;

  @ApiProperty({
    required: false,
    example: '',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: 10,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  user_id?: number;
}
