import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ListReservationInMomentDto {
  @ApiProperty({
    example: '2024-12-31T17:00:00Z',
    description: 'Момент времени для получения  броней',
  })
  @IsOptional()
  @IsDateString()
  Moment?: string;
}
