import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatusOrderItem(orderItemId: number, status: 'SERVED' | 'READY') {
    return await this.prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status },
    });
  }
  async getArchiveOrders() {
    const orders = await this.prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            status: { in: ['READY', 'SERVED'] },
          },
        },
      },
      include: {
        orderItems: {
          where: {
            status: { in: ['READY', 'SERVED'] },
          },
          include: {
            dish: {
              include: {
                dishIngredients: {
                  include: { ingredient: true },
                },
              },
            },
          },
        },
        reservation: {
          select: {
            tableId: true,
          },
        },
      },
      orderBy: { updatedAt: 'asc' },
      take: 10,
    });

    return orders.map((order) => ({
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        dish: {
          ...item.dish,
          dishIngredients: item.dish.dishIngredients.map((di) => di.ingredient),
        },
      })),
    }));
  }

  async getAllCooking() {
    const orders = await this.prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            status: 'COOKING',
          },
        },
      },
      include: {
        orderItems: {
          where: {
            status: 'COOKING',
          },
          include: {
            dish: {
              include: {
                dishIngredients: {
                  include: { ingredient: true },
                },
              },
            },
          },
        },
        reservation: {
          select: {
            tableId: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        dish: {
          ...item.dish,
          dishIngredients: item.dish.dishIngredients.map((di) => di.ingredient),
        },
      })),
    }));
  }

  async createOrder(dto: CreateOrderDto) {
    const dishes = await this.prisma.dish.findMany({
      where: {
        id: { in: dto.orderItems.map((i) => i.dishId) },
      },
    });

    if (dishes.length !== dto.orderItems.length) {
      throw new BadRequestException('Некоторые блюда не найдены');
    }

    let totalPriceOrder = 0;
    const orderItemsData = dto.orderItems.map((item) => {
      const dish = dishes.find((d) => d.id === item.dishId)!;

      totalPriceOrder += dish.price * item.quantity;

      return {
        dishId: item.dishId,
        comment: item.comment,
        quantity: item.quantity,
        priceSnapshot: dish.price, // фиксируем цену
      };
    });

    return this.prisma.order.create({
      data: {
        reservationId: dto.reservationId,
        totalPriceOrder,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: { dish: true },
        },
      },
    });
  }

  async getAllByTable(tableId: number) {
    return this.prisma.order.findMany({
      where: {
        reservation: {
          tableId,
        },
      },
      include: {
        orderItems: {
          include: { dish: true },
        },
      },
    });
  }
}
