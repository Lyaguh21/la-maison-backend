import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListReservationInPeriodDto } from './dto/list-reservation-in-period.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

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
}
