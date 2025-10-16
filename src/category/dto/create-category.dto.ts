import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'Name of the category',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  category_name: string;

  @ApiProperty({
    example: 'image.jpge',
    type: 'string',
    format: 'string',
  })
  @IsString()
  @IsOptional()
  category_image: string;

  @ApiProperty({
    example: 'this category added as test purpose',
    type: 'string',
    format: 'string',
  })
  @IsString()
  @IsOptional()
  description: string;
}
