import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { FloorItemsService } from './floor-items.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';

@Controller('floor-items')
export class FloorItemsController {
  constructor(private readonly floorItems: FloorItemsService) {}

  @ApiOperation({ summary: 'Создание интерьера (Админ)' })
  @Roles('ADMIN')
  @Post()
  createObject(@Body() dto: CreateObjectDto) {
    return this.floorItems.createObject(dto);
  }

  @ApiOperation({ summary: 'Получение всех объектов интерьера (Админ)' })
  @Roles('ADMIN')
  @Get()
  getAll() {
    return this.floorItems.getAll();
  }

  @ApiOperation({ summary: 'Обновление объектов интерьера (Админ)' })
  @Roles('ADMIN')
  @Patch()
  updateObject(@Body() dto: UpdateObjectDto) {
    return this.floorItems.updateObject(dto);
  }
}
