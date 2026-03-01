import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    example: 1,
    description: 'ID пользователя, который создает бронь (необязательно)',
  })
  @IsNumber()
  @IsOptional()
  userId?: number;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя гостя (необязательно)',
  })
  @IsString()
  @IsOptional()
  guestName?: string;

  @ApiProperty({
    example: '+7 (999) 123-45-67',
    description: 'Телефон гостя (необязательно)',
  })
  @IsPhoneNumber()
  @IsOptional()
  guestPhone?: string;

  @ApiProperty({
    example: 4,
    description: 'Количество гостей',
  })
  @IsNumber()
  @Min(1)
  guestsCount: number;

  @ApiProperty({ example: 1, description: 'ID столика' })
  @IsNumber()
  tableId: number;

  @ApiProperty({
    example: '2024-12-31T19:00:00Z',
    description: 'Время начала брони',
  })
  @IsDateString()
  startTime: Date;

  @ApiProperty({
    example: '2024-12-31T21:00:00Z',
    description: 'Время окончания брони',
  })
  @IsDateString()
  endTime: Date;
}
