import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @ApiOperation({ summary: 'Получить все заказы которые готовятся (Повар)' })
  @Roles('COOK')
  @Get('cooking')
  getAll() {
    return this.orders.getAllCooking();
  }

  @ApiOperation({ summary: 'Получить архив заказов (Повар)' })
  @Roles('COOK')
  @Get('archive')
  getArchive() {
    return this.orders.getArchiveOrders();
  }

  @ApiOperation({ summary: 'Получить готовые блюда (Официант)' })
  @Roles('WAITER')
  @Get('ready')
  getReadyOrders() {
    return this.orders.getReadyOrders();
  }

  @ApiOperation({ summary: 'Создание заказа (Все)' })
  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.orders.createOrder(dto);
  }

  @ApiOperation({
    summary: 'Изменение статуса элемента заказа(Официант, Повар)',
  })
  @Roles('WAITER', 'COOK')
  @Patch('items/:orderItemId')
  updateStatusOrderItem(
    @Body() dto: UpdateOrderItemStatusDto,
    @Param('orderItemId', ParseIntPipe) orderItemId: number,
  ) {
    return this.orders.updateStatusOrderItem(orderItemId, dto.status);
  }

  @ApiOperation({ summary: 'Получить все заказы по столу (Все)' })
  @Get('table/:tableId')
  getAllByTable(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.orders.getAllByTable(tableId);
  }
}
