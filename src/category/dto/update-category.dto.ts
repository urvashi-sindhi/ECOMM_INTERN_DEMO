import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Updated Electronics',
    description: 'New name for the category',
    required: true,
    format: 'string',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
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
