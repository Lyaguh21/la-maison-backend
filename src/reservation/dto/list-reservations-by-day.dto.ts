import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ListReservationsByDayDto {
  @ApiProperty({
    example: '2026-03-15',
    description: 'День в формате YYYY-MM-DD',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'day must be in format YYYY-MM-DD',
  })
  day: string;
}
