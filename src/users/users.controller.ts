import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { ListUsersDto } from './dto/list-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @ApiOperation({ summary: 'Получение информации о себе (Все)' })
  @Get('profile')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.users.getOne(user.userId);
  }

  @ApiOperation({ summary: 'Заполнение информации о себе (Все)' })
  @Patch('profile')
  updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user: AuthUser) {
    return this.users.updateProfile({
      userId: user.userId,
      name: dto?.name,
      phone: dto?.phone,
      userAllergens: dto?.userAllergens,
    });
  }

  @ApiOperation({ summary: ' Получение всех пользователей (Админ)' })
  @Roles('ADMIN')
  @Get()
  getAll(@Query() query: ListUsersDto) {
    return this.users.getAll(query);
  }

  @ApiOperation({ summary: 'Обновление роли пользователя (Админ)' })
  @Roles('ADMIN')
  @Patch('role')
  updateRole(@Body() dto: UpdateRoleDto) {
    return this.users.updateRole({ userId: dto.userId, role: dto.role });
  }

  @ApiOperation({ summary: ' Получение одного (Админ)' })
  @Roles('ADMIN')
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.users.getOne(id);
  }
}
