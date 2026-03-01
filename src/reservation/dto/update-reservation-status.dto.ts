import { IsIn } from 'class-validator';
import type { IStatusReservation } from '../types/type';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReservationStatusDto {
  @ApiProperty({ example: 'SEATED', description: 'Статус брони' })
  @IsIn(['BOOKED', 'SEATED', 'PAID', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
  status: IStatusReservation;
}
