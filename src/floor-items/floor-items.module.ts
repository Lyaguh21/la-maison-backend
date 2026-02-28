import { Module } from '@nestjs/common';
import { FloorItemsService } from './floor-items.service';
import { FloorItemsController } from './floor-items.controller';

@Module({
  providers: [FloorItemsService],
  controllers: [FloorItemsController]
})
export class FloorItemsModule {}
