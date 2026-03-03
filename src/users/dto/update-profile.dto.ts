import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Темыч' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '+79999999999' })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: [1, 3],
    description: 'Массив ID ингредиентов-аллергенов',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  userAllergenIds?: number[];
}
