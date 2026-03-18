import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ListFreeTablesDto {
  @ApiProperty({
    example: '18:30',
    description: 'Начало интервала в формате HH:mm',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in format HH:mm',
  })
  startTime: string;

  @ApiProperty({
    example: '20:00',
    description: 'Конец интервала в формате HH:mm',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in format HH:mm',
  })
  endTime: string;
}
