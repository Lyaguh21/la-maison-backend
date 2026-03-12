import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardWindow } from './dto/dashboard-window.dto';

type BucketUnit = 'hour' | 'day' | 'month';

type TimeWindow = {
  start: Date;
  end: Date;
  bucket: BucketUnit;
};

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenue(window: DashboardWindow = DashboardWindow.WEEK) {
    const minDate =
      window === DashboardWindow.ALL
        ? (await this.prisma.order.aggregate({ _min: { createdAt: true } }))
            ._min.createdAt
        : null;

    const range = this.getRange(window, minDate);
    const buckets = this.createBuckets(range);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      select: {
        createdAt: true,
        totalPriceOrder: true,
      },
    });

    const sums = this.initBucketsMap(buckets);

    for (const order of orders) {
      const key = this.getBucketKey(order.createdAt, range.bucket);
      sums.set(key, (sums.get(key) ?? 0) + (order.totalPriceOrder ?? 0));
    }

    return buckets.map((bucket) => ({
      date: bucket.label,
      value: Number((sums.get(bucket.key) ?? 0).toFixed(2)),
    }));
  }

  async getRevenueTotal(window: DashboardWindow = DashboardWindow.WEEK) {
    const minDate =
      window === DashboardWindow.ALL
        ? (await this.prisma.order.aggregate({ _min: { createdAt: true } }))
            ._min.createdAt
        : null;

    const range = this.getRange(window, minDate);

    const data = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
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

  async getReservations(window: DashboardWindow = DashboardWindow.WEEK) {
    const minDate =
      window === DashboardWindow.ALL
        ? (
            await this.prisma.reservation.aggregate({
              _min: { createdAt: true },
            })
          )._min.createdAt
        : null;

    const range = this.getRange(window, minDate);
    const buckets = this.createBuckets(range);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const counts = this.initBucketsMap(buckets);

    for (const reservation of reservations) {
      const key = this.getBucketKey(reservation.createdAt, range.bucket);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return buckets.map((bucket) => ({
      date: bucket.label,
      value: counts.get(bucket.key) ?? 0,
    }));
  }

  async getReservationsTotal(window: DashboardWindow = DashboardWindow.WEEK) {
    const minDate =
      window === DashboardWindow.ALL
        ? (
            await this.prisma.reservation.aggregate({
              _min: { createdAt: true },
            })
          )._min.createdAt
        : null;

    const range = this.getRange(window, minDate);

    const count = await this.prisma.reservation.count({
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
    });

    return { value: count };
  }

  async getWaitersProcessedReservationsStats(
    window: DashboardWindow = DashboardWindow.WEEK,
  ) {
    const minDate =
      window === DashboardWindow.ALL
        ? (
            await this.prisma.reservation.aggregate({
              _min: { realStartTime: true },
            })
          )._min.realStartTime
        : null;

    const range = this.getRange(window, minDate);

    const reservations = await this.prisma.reservation.groupBy({
      by: ['waiterId'],
      where: {
        waiterId: {
          not: null,
        },
        realStartTime: {
          gte: range.start,
          lt: range.end,
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
          name: waiter?.name ?? waiter?.email ?? `Waiter #${item.waiterId}`,
          reservations: item._count._all,
        };
      })
      .sort((a, b) => b.reservations - a.reservations);
  }

  async getAverageVisitDuration(
    window: DashboardWindow = DashboardWindow.WEEK,
  ) {
    const minDate =
      window === DashboardWindow.ALL
        ? (
            await this.prisma.reservation.aggregate({
              _min: { realStartTime: true },
            })
          )._min.realStartTime
        : null;

    const range = this.getRange(window, minDate);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        realStartTime: {
          gte: range.start,
          lt: range.end,
        },
        realEndTime: {
          not: null,
        },
      },
      select: {
        realStartTime: true,
        realEndTime: true,
      },
    });

    if (!reservations.length) {
      return {
        valueMinutes: 0,
      };
    }

    const totalMs = reservations.reduce((sum, item) => {
      if (!item.realStartTime || !item.realEndTime) {
        return sum;
      }

      return sum + (item.realEndTime.getTime() - item.realStartTime.getTime());
    }, 0);

    const averageMinutes = totalMs / reservations.length / 60_000;

    return {
      valueMinutes: Number(averageMinutes.toFixed(1)),
    };
  }

  private getRange(window: DashboardWindow, minDate?: Date | null): TimeWindow {
    const now = new Date();

    if (window === DashboardWindow.DAY) {
      const start = this.startOfDay(now);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      return { start, end, bucket: 'hour' };
    }

    if (window === DashboardWindow.MONTH) {
      const end = this.tomorrowStart(now);
      const start = new Date(end);
      start.setDate(start.getDate() - 30);

      return { start, end, bucket: 'day' };
    }

    if (window === DashboardWindow.YEAR) {
      const end = this.startOfMonth(now);
      end.setMonth(end.getMonth() + 1);
      const start = new Date(end);
      start.setMonth(start.getMonth() - 12);

      return { start, end, bucket: 'month' };
    }

    if (window === DashboardWindow.ALL) {
      const end = this.startOfMonth(now);
      end.setMonth(end.getMonth() + 1);
      const start = minDate
        ? this.startOfMonth(minDate)
        : this.startOfMonth(now);

      return { start, end, bucket: 'month' };
    }

    const end = this.tomorrowStart(now);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    return { start, end, bucket: 'day' };
  }

  private createBuckets(range: TimeWindow) {
    const buckets: Array<{ key: string; label: string }> = [];
    const cursor = new Date(range.start);

    while (cursor < range.end) {
      const key = this.getBucketKey(cursor, range.bucket);
      buckets.push({
        key,
        label: this.getBucketLabel(cursor, range.bucket),
      });

      if (range.bucket === 'hour') {
        cursor.setHours(cursor.getHours() + 1, 0, 0, 0);
      } else if (range.bucket === 'day') {
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(0, 0, 0, 0);
      } else {
        cursor.setMonth(cursor.getMonth() + 1, 1);
        cursor.setHours(0, 0, 0, 0);
      }
    }

    return buckets;
  }

  private getBucketKey(date: Date, bucket: BucketUnit) {
    if (bucket === 'hour') {
      const d = new Date(date);
      d.setMinutes(0, 0, 0);
      return `${d.toISOString().slice(0, 13)}:00`;
    }

    if (bucket === 'day') {
      return this.startOfDay(date).toISOString().slice(0, 10);
    }

    const monthStart = this.startOfMonth(date);
    return monthStart.toISOString().slice(0, 7);
  }

  private getBucketLabel(date: Date, bucket: BucketUnit) {
    if (bucket === 'hour') {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (bucket === 'day') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      });
    }

    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      year: 'numeric',
    });
  }

  private initBucketsMap(buckets: Array<{ key: string }>) {
    const map = new Map<string, number>();

    for (const bucket of buckets) {
      map.set(bucket.key, 0);
    }

    return map;
  }

  private startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private startOfMonth(date: Date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private tomorrowStart(date: Date) {
    const tomorrow = this.startOfDay(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
}
