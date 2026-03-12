import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { DashboardsService } from './dashboards.service';

@Controller('dashboards')
@Roles('ADMIN', 'WAITER')
export class DashboardsController {
  constructor(private readonly dashboards: DashboardsService) {}

  @ApiOperation({ summary: 'Выручка за 7 дней' })
  @Get('revenue/7-days')
  getRevenue7Days() {
    return this.dashboards.getRevenue7Days();
  }

  @ApiOperation({ summary: 'Выручка за сегодня' })
  @Get('revenue/today')
  getRevenueToday() {
    return this.dashboards.getRevenueToday();
  }

  @ApiOperation({ summary: 'Количество бронирований за 7 дней' })
  @Get('reservations/7-days')
  getReservations7Days() {
    return this.dashboards.getReservations7Days();
  }

  @ApiOperation({ summary: 'Количество бронирований за сегодня' })
  @Get('reservations/today')
  getReservationsToday() {
    return this.dashboards.getReservationsToday();
  }

  @ApiOperation({
    summary:
      'Список официантов с количеством обработанных резерваций за 7 дней',
  })
  @Get('waiter-processed/7-days')
  getWaitersProcessedReservationsStats() {
    return this.dashboards.getWaitersProcessedReservationsStats();
  }
}
