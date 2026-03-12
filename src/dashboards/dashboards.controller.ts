import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { DashboardsService } from './dashboards.service';
import { DashboardWindowDto } from './dto/dashboard-window.dto';

@Controller('dashboards')
@Roles('ADMIN', 'WAITER')
export class DashboardsController {
  constructor(private readonly dashboards: DashboardsService) {}

  @ApiOperation({ summary: 'График выручки за выбранный период' })
  @Get('revenue')
  getRevenue(@Query() query: DashboardWindowDto) {
    return this.dashboards.getRevenue(query.window);
  }

  @ApiOperation({ summary: 'Суммарная выручка за выбранный период' })
  @Get('revenue/total')
  getRevenueTotal(@Query() query: DashboardWindowDto) {
    return this.dashboards.getRevenueTotal(query.window);
  }

  @ApiOperation({ summary: 'График бронирований за выбранный период' })
  @Get('reservations')
  getReservations(@Query() query: DashboardWindowDto) {
    return this.dashboards.getReservations(query.window);
  }

  @ApiOperation({
    summary: 'Суммарное количество бронирований за выбранный период',
  })
  @Get('reservations/total')
  getReservationsTotal(@Query() query: DashboardWindowDto) {
    return this.dashboards.getReservationsTotal(query.window);
  }

  @ApiOperation({
    summary:
      'Список официантов с количеством обработанных резерваций за выбранный период',
  })
  @Get('waiter-processed')
  getWaitersProcessedReservationsStats(@Query() query: DashboardWindowDto) {
    return this.dashboards.getWaitersProcessedReservationsStats(query.window);
  }

  @ApiOperation({
    summary: 'Среднее время посещения в минутах за выбранный период',
  })
  @Get('average-visit-duration')
  getAverageVisitDuration(@Query() query: DashboardWindowDto) {
    return this.dashboards.getAverageVisitDuration(query.window);
  }
}
