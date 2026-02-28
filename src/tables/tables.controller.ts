import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tables: TablesService) {}

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.tables.getOne(id);
  }
}
