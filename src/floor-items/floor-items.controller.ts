import { Body, Controller, Get, Put } from '@nestjs/common';
import { FloorItemsService } from './floor-items.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { SyncFloorDto } from './dto/sync-floor-dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('floor-items')
export class FloorItemsController {
  constructor(private readonly floorItems: FloorItemsService) {}

  @ApiOperation({ summary: 'Получение всех объектов интерьера (Админ)' })
  @Get()
  @Public()
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
