import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Напитки', description: 'Название категории' })
  @IsString()
  @MinLength(3)
  name: string;
}
