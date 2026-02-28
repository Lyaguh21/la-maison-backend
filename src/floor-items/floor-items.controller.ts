import { Body, Controller, Get, Patch, Post, Put } from '@nestjs/common';
import { FloorItemsService } from './floor-items.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { SyncFloorDto } from './dto/sync-floor-dto';

@Controller('floor-items')
export class FloorItemsController {
  constructor(private readonly floorItems: FloorItemsService) {}

  @ApiOperation({ summary: 'Получение всех объектов интерьера (Админ)' })
  @Roles('ADMIN')
  @Get()
  getAll() {
    return this.floorItems.getAll();
  }

  @ApiOperation({ summary: 'Синхронизация объектов интерьера (Админ)' })
  @Roles('ADMIN')
  @Put('sync')
  async sync(@Body() dto: SyncFloorDto) {
    await this.floorItems.sync(dto);
    return await this.floorItems.getAll();
  }
}
