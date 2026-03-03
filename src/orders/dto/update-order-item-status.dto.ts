import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateOrderItemStatusDto {
  @ApiProperty({ example: 'READY', description: 'Статус элемента заказа' })
  @IsIn(['SERVED', 'READY'])
  status: 'SERVED' | 'READY';
}
