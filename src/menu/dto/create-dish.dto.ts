import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDishDto {
  @ApiProperty({ example: 1, description: 'ID категории блюда' })
  @IsNumber()
  @Min(1)
  categoryId: number;

  @ApiProperty({ example: 'Борщ', description: 'Название блюда' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Русский суп с мясом и овощами',
    description: 'Описание блюда',
  })
  @IsString()
  @MinLength(6)
  description: string;

  @ApiProperty({ example: 100, description: 'Цена блюда в рублях' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: [1, 2], description: 'Массив ID ингредиентов' })
  @IsArray()
  ingredientsIds: number[];
}
