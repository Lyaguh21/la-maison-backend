import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreateObjectDto } from './create-object.dto';
export class UpdateObjectDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  objectId?: number;

  @ApiProperty({ example: 6 })
  @IsNumber()
  @Min(0)
  x: number;

  @ApiProperty({ example: 6 })
  @IsNumber()
  @Min(0)
  y: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(0)
  height: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(0)
  width: number;

  @ApiProperty({ example: 180 })
  @IsNumber()
  @Min(0)
  @Max(360)
  rotation: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tableId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  number: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  photo?: string;
}
