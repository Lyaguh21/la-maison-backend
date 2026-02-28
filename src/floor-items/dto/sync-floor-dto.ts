import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  Max,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SyncFloorItemDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID объекта интерьера (для обновления)',
  })
  @IsOptional()
  @IsNumber()
  id?: number; // floor_item id

  @ApiProperty({
    example: 'TABLE',
    enum: ['WC', 'EXIT', 'BAR', 'TABLE'],
    description: 'Тип объекта интерьера (Только для создания)',
  })
  @IsIn(['WC', 'EXIT', 'BAR', 'TABLE'])
  @IsOptional()
  type?: 'WC' | 'EXIT' | 'BAR' | 'TABLE';

  @ApiProperty({
    example: 10,
    description: 'Координата X объекта интерьера',
  })
  @IsNumber()
  x: number;

  @ApiProperty({
    example: 20,
    description: 'Координата Y объекта интерьера',
  })
  @IsNumber()
  y: number;

  @ApiProperty({ example: 100, description: 'Ширина объекта интерьера' })
  @IsNumber()
  width: number;

  @ApiProperty({ example: 80, description: 'Высота объекта интерьера' })
  @IsNumber()
  height: number;

  @ApiProperty({
    example: 180,
    description: 'Угол поворота объекта интерьера (0-360 градусов)',
  })
  @IsNumber()
  @Min(0)
  @Max(360)
  rotation: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID стола (только для объектов типа TABLE)(для обновления)',
  })
  @IsOptional()
  @IsNumber()
  tableId?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Номер стола (только для объектов типа TABLE)',
  })
  @IsOptional()
  @IsNumber()
  number?: number;

  @ApiPropertyOptional({
    example: 'FOUR',
    enum: ['TWO', 'FOUR', 'SIX'],
    description:
      'Тип стола (только для объектов типа TABLE)(только для создания)',
  })
  @IsOptional()
  @IsIn(['TWO', 'FOUR', 'SIX'])
  tableType?: 'TWO' | 'FOUR' | 'SIX';

  @ApiPropertyOptional({
    example: 'https://example.com/photo.jpg',
    description: 'Фото стола (только для объектов типа TABLE)',
  })
  @IsOptional()
  @IsString()
  photo?: string;
}

export class SyncFloorDto {
  @ApiProperty({
    type: [SyncFloorItemDto],
    description: 'Массив объектов интерьера',
    example: [
      {
        id: 4,
        type: 'TABLE',
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        rotation: 180,
        number: 51,
        tableType: 'SIX',
        tableId: 6,
      },
      {
        id: 5,
        type: 'WC',
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        rotation: 180,
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => SyncFloorItemDto)
  items: SyncFloorItemDto[];
}
