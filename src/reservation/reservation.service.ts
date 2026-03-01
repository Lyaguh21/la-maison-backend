import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { TablesService } from 'src/tables/tables.service';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tables: TablesService,
  ) {}

  getAll() {
    return this.prisma.reservation.findMany();
  }

  async getOne(id: number) {
    return await this.prisma.reservation.findUnique({ where: { id } });
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
}
