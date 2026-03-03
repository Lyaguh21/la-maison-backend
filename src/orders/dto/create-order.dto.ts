import { ArrayMinSize, IsInt, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  reservationId: number;

  @ApiProperty({ example: [{ dishId: 1, quantity: 2, comment: 'No onions' }] })
  @ValidateNested({ each: true }) // Валидируется каждый элемент массива
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  orderItems: CreateOrderItemDto[];
}
