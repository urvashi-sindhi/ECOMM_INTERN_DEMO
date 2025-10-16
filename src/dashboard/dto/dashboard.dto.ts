import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TimeFrame } from 'src/libs/utility/constants/enums';

export class OrderStatisticsDto {
  @ApiProperty({
    example: TimeFrame.WEEK,
    enum: [TimeFrame.WEEK, TimeFrame.MONTH, TimeFrame.YEAR],
  })
  @IsEnum({
    week: TimeFrame.WEEK,
    month: TimeFrame.MONTH,
    year: TimeFrame.YEAR,
  })
  timeFrame: string;
}
