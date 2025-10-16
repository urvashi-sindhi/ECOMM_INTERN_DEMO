import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CategoryListDto {
  @ApiProperty({ required: false, example: 1, type: 'number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false, example: 10, type: 'number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @ApiProperty({
    required: false,
    example: 'category_name',
    enum: ['category_name', 'createdAt', 'id'],
  })
  @IsOptional()
  @IsString()
  sortKey?: string;

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  sortValue?: string;

  @ApiProperty({ required: false, example: 'electronics' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CategoryOfProductDto {
  @ApiProperty({ required: false, example: 1, type: 'number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  category_id?: number;

  @ApiProperty({ required: false, example: 1, type: 'number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false, example: 10, type: 'number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @ApiProperty({
    required: false,
    example: 'id',
    enum: ['createdAt', 'id'],
  })
  @IsOptional()
  @IsString()
  sortKey?: string;

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  sortValue?: string;

  @ApiProperty({ required: false, example: '' })
  @IsOptional()
  @IsString()
  search?: string;
}
