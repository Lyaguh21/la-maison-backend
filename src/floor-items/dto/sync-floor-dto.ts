import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  Max,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';

const FLOOR_ITEM_TYPES = ['WC', 'EXIT', 'BAR', 'TABLE'] as const;
const TABLE_TYPES = ['TWO', 'FOUR', 'SIX'] as const;

export type FloorItemType = (typeof FLOOR_ITEM_TYPES)[number];
export type TableType = (typeof TABLE_TYPES)[number];

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
    enum: FLOOR_ITEM_TYPES,
    description: 'Тип объекта интерьера',
  })
  @IsIn(FLOOR_ITEM_TYPES)
  type: FloorItemType;

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
  @Min(1)
  number?: number;

  @ApiPropertyOptional({
    example: 'FOUR',
    enum: TABLE_TYPES,
    description: 'Тип стола (только для объектов типа TABLE)',
  })
  @IsOptional()
  @IsIn(TABLE_TYPES)
  tableType?: TableType;
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncFloorItemDto)
  items: SyncFloorItemDto[];
}
