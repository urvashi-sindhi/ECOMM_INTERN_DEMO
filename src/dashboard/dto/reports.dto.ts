import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class OrderReportDto {
  @ApiProperty({
    example: '',
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsOptional()
  search: string;

  @ApiProperty({
    example: 10,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  limit: number;

  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  page: number;

  @ApiProperty({
    example: 'asc',
    type: 'string',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortValue: string;

  @ApiProperty({
    example: 'id',
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortKey: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59.999Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate: string;
}

export class UserReportDto {
  @ApiProperty({
    example: '',
    type: 'string',
    format: 'string',
    required: false,
  })
  @IsOptional()
  search: string;

  @ApiProperty({
    example: 10,
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  limit: number;

  @ApiProperty({
    example: 1,
    type: 'number',
    format: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  page: number;

  @ApiProperty({
    example: 'asc',
    type: 'string',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortValue: string;

  @ApiProperty({
    example: 'id',
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortKey: string;
}
