import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservation: ReservationService) {}

  @ApiOperation({ summary: 'Получение всех броней (Администратор, Официант)' })
  @Roles('ADMIN', 'WAITER')
  @Get()
  getAll() {
    return this.reservation.getAll();
  }

  @ApiOperation({ summary: 'Получение одной брони (Администратор, Официант)' })
  @Roles('ADMIN', 'WAITER')
  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.reservation.getOne(id);
  }

  @ApiOperation({ summary: 'Создание новой брони (Пользователь, Официант)' })
  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservation.create(dto);
  }

  @ApiOperation({ summary: 'Изменение брони (Пользователь, Официант)' })
  @Patch(':id')
  update(@Body() dto: UpdateReservationDto, @Param('id') id: number) {
    return this.reservation.update(id, dto);
  }

  @ApiOperation({ summary: 'Изменение статуса брони (Официант)' })
  @Roles('WAITER')
  @Patch('status/:id')
  updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateReservationStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservation.updateStatus(id, user, dto);
  }
}
