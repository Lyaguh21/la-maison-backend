import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { TablesService } from 'src/tables/tables.service';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { ListReservationInMomentDto } from './dto/list-reservations-in-moment';
import { ListReservationsInRangeDto } from './dto/list-reservations-in-range.dto';

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

  private getRangeInDay(day: string, startTime: string, endTime: string) {
    const start = new Date(`${day}T${startTime}:00.000Z`);
    const end = new Date(`${day}T${endTime}:00.000Z`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException(
        'Неверный формат даты или времени. Используйте day=YYYY-MM-DD и время HH:mm',
      );
    }

    if (start > end) {
      throw new BadRequestException('startTime не может быть позже endTime');
    }

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

  async getAllInRange(dto: ListReservationsInRangeDto) {
    const { start, end } = this.getRangeInDay(
      dto.day,
      dto.startTime,
      dto.endTime,
    );

    const reservations = await this.prisma.reservation.findMany({
      where: {
        startTime: { lte: end },
        endTime: { gte: start },
      },
      include: {
        order: {
          select: { totalPriceOrder: true },
        },
      },
    });

    const sorted = reservations.sort((a, b) => {
      const aStartDistance = Math.abs(a.startTime.getTime() - start.getTime());
      const bStartDistance = Math.abs(b.startTime.getTime() - start.getTime());

      if (aStartDistance !== bStartDistance) {
        return aStartDistance - bStartDistance;
      }

      const aEndDistance = Math.abs(a.endTime.getTime() - end.getTime());
      const bEndDistance = Math.abs(b.endTime.getTime() - end.getTime());

      if (aEndDistance !== bEndDistance) {
        return aEndDistance - bEndDistance;
      }

      return a.startTime.getTime() - b.startTime.getTime();
    });

    return this.mapReservationsWithTotalPrice(sorted);
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

    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new BadRequestException('Некорректный формат времени брони');
    }

    if (startTime >= endTime) {
      throw new BadRequestException(
        'Время начала брони должно быть раньше времени окончания',
      );
    }

    const overlappingReservation = await this.prisma.reservation.findFirst({
      where: {
        tableId: reservation.tableId,
        status: { not: 'CANCELLED' },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { id: true },
    });

    if (overlappingReservation) {
      throw new BadRequestException(
        'Этот стол уже забронирован на выбранный интервал времени',
      );
    }

    return await this.prisma.reservation.create({
      data: {
        userId: reservation.userId,
        guestName: reservation.guestName,
        guestPhone: reservation.guestPhone,
        guestsCount: reservation.guestsCount,
        tableId: reservation.tableId,
        startTime,
        endTime,
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
