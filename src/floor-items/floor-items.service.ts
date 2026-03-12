import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SyncFloorDto } from './dto/sync-floor-dto';

@Injectable()
export class FloorItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    const items = await this.prisma.floorItems.findMany({
      select: {
        id: true,
        type: true,
        x: true,
        y: true,
        width: true,
        height: true,
        rotation: true,
        tableId: true,
        table: {
          select: {
            number: true,
            tableType: true,
          },
        },
      },
    });

    return items.map(({ table, tableId, ...item }) => {
      if (table) {
        return {
          ...item,
          tableId,
          number: table.number,
          tableType: table.tableType,
        };
      }
      return item;
    });
  }

  async sync(dto: SyncFloorDto) {
    return this.prisma.$transaction(async (tx) => {
      const keepFloorItemIds: number[] = [];

      for (const item of dto.items) {
        if (item.type === 'TABLE') {
          if (!item.number || !item.tableType) {
            throw new BadRequestException(
              'Для объектов типа TABLE должны быть указаны number и tableType',
            );
          }

          const table = item.tableId
            ? await tx.tables.update({
                where: { id: item.tableId },
                data: {
                  number: item.number,
                  tableType: item.tableType,
                },
              })
            : await tx.tables.create({
                data: {
                  number: item.number,
                  tableType: item.tableType,
                },
              });

          const floorItem = item.id
            ? await tx.floorItems.update({
                where: { id: item.id },
                data: {
                  type: 'TABLE',
                  tableId: table.id,
                  x: item.x,
                  y: item.y,
                  width: item.width,
                  height: item.height,
                  rotation: item.rotation,
                },
              })
            : await tx.floorItems.create({
                data: {
                  type: 'TABLE',
                  tableId: table.id,
                  x: item.x,
                  y: item.y,
                  width: item.width,
                  height: item.height,
                  rotation: item.rotation,
                },
              });

          keepFloorItemIds.push(floorItem.id);
          continue;
        }

        const floorItem = item.id
          ? await tx.floorItems.update({
              where: { id: item.id },
              data: {
                type: item.type ?? 'EXIT',
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                rotation: item.rotation,
                tableId: null,
              },
            })
          : await tx.floorItems.create({
              data: {
                type: item.type ?? 'EXIT',
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                rotation: item.rotation,
                tableId: null,
              },
            });

        keepFloorItemIds.push(floorItem.id);
      }

      await tx.floorItems.deleteMany({
        where: keepFloorItemIds.length
          ? { id: { notIn: keepFloorItemIds } }
          : {},
      });

      return true;
    });
  }
}
