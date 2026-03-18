import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListReservationInPeriodDto } from './dto/list-reservation-in-period.dto';
import { ListFreeTablesDto } from './dto/list-free-tables.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  private parseLocalTime(time: string) {
    const match = /^(\d{2}):(\d{2})$/.exec(time);
    if (!match) {
      throw new BadRequestException('Неверный формат времени. Ожидается HH:mm');
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new BadRequestException('Неверный формат времени. Ожидается HH:mm');
    }

    return { hours, minutes };
  }

  private getRangeInToday(startTime: string, endTime: string) {
    const parsedStart = this.parseLocalTime(startTime);
    const parsedEnd = this.parseLocalTime(endTime);

    const localDay = new Date();

    const start = new Date(localDay);
    start.setHours(parsedStart.hours, parsedStart.minutes, 0, 0);

    const end = new Date(localDay);
    end.setHours(parsedEnd.hours, parsedEnd.minutes, 0, 0);

    if (start >= end) {
      throw new BadRequestException(
        'Время начала должно быть раньше времени окончания',
      );
    }

    return { start, end };
  }

  getAll() {
    return this.prisma.tables.findMany();
  }

  async getOne(id: number) {
    const table = await this.prisma.tables.findUnique({
      where: { id },
    });

    if (!table) {
      throw new BadRequestException('Стол не найден');
    }

    return table;
  }

  async getReservations(id: number) {
    const exists = await this.getOne(id);

    if (!exists) throw new BadRequestException('Стол не найден');

    return this.prisma.reservation.findMany({
      where: { tableId: id },
    });
  }

  async getReservationsInPeriod(id: number, dto: ListReservationInPeriodDto) {
    const exists = await this.getOne(id);

    if (!exists) throw new BadRequestException('Стол не найден');

    return this.prisma.reservation.findMany({
      where: {
        tableId: id,
        startTime: { lt: dto.endTime ?? new Date().toISOString() },
        endTime: { gt: dto.startTime ?? new Date().toISOString() },
      },
    });
  }

  async getFreeTables(dto: ListFreeTablesDto) {
    const { start, end } = this.getRangeInToday(dto.startTime, dto.endTime);

    const busyTables = await this.prisma.reservation.findMany({
      where: {
        status: { not: 'CANCELLED' },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      select: {
        tableId: true,
      },
      distinct: ['tableId'],
    });

    const busyTableIds = busyTables.map((reservation) => reservation.tableId);

    const freeTables = await this.prisma.tables.findMany({
      where: {
        id: {
          notIn: busyTableIds,
        },
      },
      select: {
        id: true,
        number: true,
        tableType: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        number: 'asc',
      },
    });

    return freeTables.map(({ tableType, ...table }) => ({
      ...table,
      type: tableType,
    }));
  }
}
