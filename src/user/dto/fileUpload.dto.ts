import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  @IsString()
  files: any[];
}
