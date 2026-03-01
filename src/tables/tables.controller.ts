import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { ApiOperation } from '@nestjs/swagger';
import { ListReservationInPeriodDto } from './dto/list-reservation-in-period.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tables: TablesService) {}

  @ApiOperation({ summary: 'Получение всех столиков (Все)' })
  @Get()
  getAll() {
    return this.tables.getAll();
  }

  @ApiOperation({ summary: 'Получение стола по ID (Все)' })
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.tables.getOne(id);
  }

  @ApiOperation({ summary: 'Получение всех броней по ID стола (Все)' })
  @Get(':id/reservations')
  getReservationsByTableId(@Param('id', ParseIntPipe) id: number) {
    return this.tables.getReservations(id);
  }

  @ApiOperation({
    summary: 'Получение всех броней по ID стола в заданный период (Все)',
  })
  @Get(':id/reservations-period')
  getReservationsInPeriod(
    @Param('id', ParseIntPipe) id: number,
    @Query() dto: ListReservationInPeriodDto,
  ) {
    return this.tables.getReservationsInPeriod(id, dto);
  }
}
