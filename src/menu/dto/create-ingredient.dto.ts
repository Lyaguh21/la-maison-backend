import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Картофель', description: 'Название ингредиента' })
  @IsString()
  @MinLength(3)
  name: string;
}
