import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateObjectDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  x: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  y: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  height: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  width: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  @Max(360)
  rotation: number;

  @ApiProperty({ example: 'TABLE' })
  @IsIn(['WC', 'EXIT', 'BAR', 'TABLE'])
  type: 'WC' | 'EXIT' | 'BAR' | 'TABLE';

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  number: number;

  @ApiProperty({ example: 'TWO', required: false })
  @IsIn(['TWO', 'FOUR', 'SIX'])
  @IsOptional()
  tableType: 'TWO' | 'FOUR' | 'SIX';

  @IsString()
  @IsOptional()
  photo?: string;
}
