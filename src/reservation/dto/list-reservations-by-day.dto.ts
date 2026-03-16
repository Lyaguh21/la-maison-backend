import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  Matches,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { StatusReservations } from '@prisma/client';
import { Transform } from 'class-transformer';

export class ListReservationsByDayDto {
  @ApiProperty({
    example: '2026-03-15',
    description: 'День в формате YYYY-MM-DD',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'day must be in format YYYY-MM-DD',
  })
  day: string;

  @ApiPropertyOptional({
    enum: StatusReservations,
    isArray: true,
    description:
      'Статусы брони. Можно передать один или несколько. Если не указаны — возвращаются все статусы',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string' && value.includes(',')) {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }

    return [value];
  })
  @IsArray()
  @IsEnum(StatusReservations, { each: true })
  status?: StatusReservations[];
}
