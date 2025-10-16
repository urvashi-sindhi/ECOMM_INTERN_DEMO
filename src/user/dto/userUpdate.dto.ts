import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Gender } from 'src/libs/utility/constants/enums';

export class AddressDto {
  @ApiProperty({
    example: 101,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  country_id: number;

  @ApiProperty({
    example: 10,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  state_id: number;

  @ApiProperty({
    example: 5,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  city_id: number;

  @ApiProperty({
    example: 307022,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  postal_code: number;

  @ApiProperty({
    example: 'home',
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  label: string;

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
}

export class UserUpdateDto {
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
    example: Gender.MALE,
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsEnum([Gender.MALE, Gender.FEMALE, Gender.OTHER])
  @IsOptional()
  gender: string;

  @ApiProperty({
    example: 'avatar.jpge',
    type: 'string',
    format: 'string',
  })
  @IsString()
  @IsOptional()
  profile_image: string;

  @ApiProperty({ type: AddressDto, required: false })
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto;
}
