import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { TablesService } from 'src/tables/tables.service';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { ListReservationInMomentDto } from './dto/list-reservations-in-moment';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tables: TablesService,
  ) {}

  private getDayRange(day: string) {
    const start = new Date(`${day}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException(
        'Неверный формат day. Ожидается YYYY-MM-DD',
      );
    }

    const end = new Date(`${day}T23:59:59.999Z`);
    return { start, end };
  }

  private mapReservationsWithTotalPrice(
    reservations: Array<
      Awaited<ReturnType<typeof this.prisma.reservation.findMany>>[number]
    >,
  ) {
    return reservations.map(({ order, ...reservation }: any) => ({
      ...reservation,
      totalPrice: order.reduce(
        (sum: number, o: { totalPriceOrder: number | null }) =>
          sum + (o.totalPriceOrder ?? 0),
        0,
      ),
    }));
  }

  async getAll(day?: string) {
    const where = day
      ? (() => {
          const { start, end } = this.getDayRange(day);
          return {
            startTime: { lte: end },
            endTime: { gte: start },
          };
        })()
      : undefined;

    const reservations = await this.prisma.reservation.findMany({
      where,
      include: {
        order: {
          select: { totalPriceOrder: true },
        },
      },
    });

    return this.mapReservationsWithTotalPrice(reservations);
  }

  async getAllByTableAndDay(tableId: number, day: string) {
    const { start, end } = this.getDayRange(day);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        tableId,
        startTime: { lte: end },
        endTime: { gte: start },
      },
      include: {
        order: {
          select: { totalPriceOrder: true },
        },
      },
    });

    return this.mapReservationsWithTotalPrice(reservations);
  }

  async getOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });
    if (!reservation) {
      throw new BadRequestException('Бронь не найдена');
    }

    const totalPrice = await this.prisma.order.aggregate({
      where: {
        reservationId: id,
      },
      _sum: {
        totalPriceOrder: true,
      },
    });

    return { ...reservation, totalPrice: totalPrice._sum.totalPriceOrder };
  }

  async create(reservation: CreateReservationDto) {
    const table = await this.tables.getOne(reservation.tableId);
    if (!table) {
      throw new Error('Стол не найден');
    }

    return await this.prisma.reservation.create({
      data: {
        userId: reservation.userId,
        guestName: reservation.guestName,
        guestPhone: reservation.guestPhone,
        guestsCount: reservation.guestsCount,
        tableId: reservation.tableId,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      },
    });
  }

  async update(id: number, reservation: UpdateReservationDto) {
    return await this.prisma.reservation.update({
      where: { id },
      data: {
        userId: reservation.userId,
        guestName: reservation.guestName,
        guestPhone: reservation.guestPhone,
        guestsCount: reservation.guestsCount,
        tableId: reservation.tableId,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      },
    });
  }

  async updateStatus(
    id: number,
    user: AuthUser,
    reservation: UpdateReservationStatusDto,
  ) {
    const existing = await this.getOne(id);

    if (!existing) throw new BadRequestException('Бронь не найдена');

    if (reservation.status === 'SEATED') {
      return await this.prisma.reservation.update({
        where: { id },
        data: {
          status: reservation.status,
          realStartTime: new Date(),
          waiterId: user.userId,
        },
      });
    } else if (reservation.status === 'PAID') {
      return await this.prisma.reservation.update({
        where: { id },
        data: {
          status: reservation.status,
          realEndTime: new Date(),
        },
      });
    } else {
      return await this.prisma.reservation.update({
        where: { id },
        data: {
          status: reservation.status,
        },
      });
    }
  }

  async getMoment(dto: ListReservationInMomentDto) {
    const moment = dto.Moment ?? new Date().toISOString();

    return await this.prisma.reservation.findMany({
      where: {
        OR: [
          // Бронь попадает в момент времени
          {
            startTime: { lte: moment },
            endTime: { gte: moment },
          },
          // Гости сидят (realStartTime есть, realEndTime нет)
          {
            realStartTime: { not: null },
            realEndTime: null,
          },
        ],
      },
    });
  }
}
