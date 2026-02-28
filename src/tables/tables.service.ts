import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(id: number) {
    const table = await this.prisma.tables.findUnique({
      where: { id },
    });

    if (!table) {
      throw new BadRequestException('Стол не найден');
    }

    return table;
  }
}
