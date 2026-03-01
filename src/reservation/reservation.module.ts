import { Module } from '@nestjs/common';
import { TablesModule } from '../tables/tables.module';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

@Module({
  imports: [TablesModule],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
