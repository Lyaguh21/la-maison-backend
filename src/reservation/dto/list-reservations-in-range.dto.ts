import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ListReservationsInRangeDto {
  @ApiProperty({
    example: '2026-03-15',
    description: 'День в формате YYYY-MM-DD',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'day must be in format YYYY-MM-DD',
  })
  day: string;

  @ApiProperty({
    example: '12:00',
    description: 'Начало отрезка в формате HH:mm',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in format HH:mm',
  })
  startTime: string;

  @ApiProperty({
    example: '15:30',
    description: 'Конец отрезка в формате HH:mm',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in format HH:mm',
  })
  endTime: string;
}
