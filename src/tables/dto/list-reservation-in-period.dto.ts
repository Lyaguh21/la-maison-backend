import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ListReservationInPeriodDto {
  @ApiPropertyOptional({
    example: '2024-12-31T17:00:00Z',
    description: 'Время начала периода',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({
    example: '2024-12-31T23:00:00Z',
    description: 'Время окончания периода',
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
