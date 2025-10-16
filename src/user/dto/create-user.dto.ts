import {
  IsEmail,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Matches,
  ValidateNested,
  Length,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Gender } from 'src/libs/utility/constants/enums';

export class AddressDto {
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
  city_id: number;

  @ApiProperty({
    example: 307022,
    type: 'number',
    format: 'number',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  postal_code: number;

  @ApiProperty({
    example: 'home',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  label: string;

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
}
export class CreateUserDto {
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
    example: 'john@example.com',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email should be in correct format.' })
  email: string;

  @ApiProperty({
    example: 'Password@123',
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message:
      'Password must contain at least one uppercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    example: '7654565464',
    type: 'string',
    format: 'string',
    required: true,
    description: 'Must be unique, 10 digits only',
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 10)
  phone_number: string;

  @ApiProperty({
    example: Gender.MALE,
    type: 'string',
    format: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum([Gender.MALE, Gender.FEMALE, Gender.OTHER])
  gender: string;

  @ApiProperty({
    example: 'avatar.jpge',
    type: 'string',
    format: 'string',
  })
  @IsString()
  @IsOptional()
  profile_image: string;

  @ApiProperty({ type: AddressDto, required: true })
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto;
}
