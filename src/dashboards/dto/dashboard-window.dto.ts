import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum DashboardWindow {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all',
}

export class DashboardWindowDto {
  @ApiPropertyOptional({
    enum: DashboardWindow,
    default: DashboardWindow.WEEK,
    description: 'Окно агрегации для метрик',
  })
  @IsOptional()
  @IsEnum(DashboardWindow)
  window?: DashboardWindow;
}
