import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenue7Days() {
    const period = this.getDaysPeriod(7);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: period.start,
          lt: period.end,
        },
      },
      select: {
        createdAt: true,
        totalPriceOrder: true,
      },
    });

    const sums = this.initDayMap(period.days);

    for (const order of orders) {
      const key = this.toDayKey(order.createdAt);
      sums.set(key, (sums.get(key) ?? 0) + (order.totalPriceOrder ?? 0));
    }

    return period.days.map((day) => ({
      date: this.toChartDate(day),
      value: Number((sums.get(this.toDayKey(day)) ?? 0).toFixed(2)),
    }));
  }

  async getRevenueToday() {
    const { todayStart, tomorrowStart } = this.getTodayRange();

    const data = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
      _sum: {
        totalPriceOrder: true,
      },
    });

    return {
      value: Number((data._sum.totalPriceOrder ?? 0).toFixed(2)),
    };
  }

  async getReservations7Days() {
    const period = this.getDaysPeriod(7);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        createdAt: {
          gte: period.start,
          lt: period.end,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const counts = this.initDayMap(period.days);

    for (const reservation of reservations) {
      const key = this.toDayKey(reservation.createdAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return period.days.map((day) => ({
      date: this.toChartDate(day),
      value: counts.get(this.toDayKey(day)) ?? 0,
    }));
  }

  async getReservationsToday() {
    const { todayStart, tomorrowStart } = this.getTodayRange();

    const count = await this.prisma.reservation.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    });

    return { value: count };
  }

  async getWaitersProcessedReservationsStats() {
    const period = this.getDaysPeriod(7);

    const reservations = await this.prisma.reservation.groupBy({
      by: ['waiterId'],
      where: {
        waiterId: {
          not: null,
        },
        realStartTime: {
          gte: period.start,
          lt: period.end,
        },
      },
      _count: {
        _all: true,
      },
    });

    const waiterIds = reservations
      .map((item) => item.waiterId)
      .filter((id): id is number => id !== null);

    const waiters = await this.prisma.user.findMany({
      where: {
        id: { in: waiterIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const waitersMap = new Map(waiters.map((w) => [w.id, w]));

    return reservations
      .filter((item) => item.waiterId !== null)
      .map((item) => {
        const waiter = waitersMap.get(item.waiterId!);

        return {
          //   waiterId: item.waiterId,
          name: waiter?.name ?? waiter?.email ?? `Waiter #${item.waiterId}`,
          reservations: item._count._all,
        };
      })
      .sort((a, b) => b.reservations - a.reservations);
  }

  private getTodayRange() {
    const now = new Date();
    const todayStart = this.startOfDay(now);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    return { todayStart, tomorrowStart };
  }

  private getDaysPeriod(daysCount: number) {
    const { todayStart, tomorrowStart } = this.getTodayRange();
    const start = new Date(todayStart);
    start.setDate(start.getDate() - (daysCount - 1));

    const days: Date[] = [];

    for (let i = 0; i < daysCount; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return {
      start,
      end: tomorrowStart,
      days,
    };
  }

  private startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private toDayKey(date: Date) {
    const d = this.startOfDay(date);
    return d.toISOString().slice(0, 10);
  }

  private toChartDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    });
  }

  private initDayMap(days: Date[]) {
    const map = new Map<string, number>();

    for (const day of days) {
      map.set(this.toDayKey(day), 0);
    }

    return map;
  }
}
