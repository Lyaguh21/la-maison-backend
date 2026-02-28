import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SyncFloorDto } from './dto/sync-floor-dto';

@Injectable()
export class FloorItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.floorItems.findMany({
      select: {
        id: true,
        type: true,
        x: true,
        y: true,
        width: true,
        height: true,
        rotation: true,
        table: {
          select: {
            id: true,
            number: true,
            tableType: true,
            photo: true,
            updatedAt: true,
          },
        },
        updatedAt: true,
      },
    });
  }

  async sync(dto: SyncFloorDto) {
    return this.prisma.$transaction(async (tx) => {
      // В этот массив положим ВСЕ id, которые должны остаться (старые + новые)
      const keepFloorItemIds: number[] = [];

      for (const item of dto.items) {
        // 1) TABLE: сначала создаём/обновляем Tables, потом FloorItems с tableId
        if (item.type === 'TABLE') {
          if (!item.number || !item.tableType) {
            throw new BadRequestException(
              'Для объектов типа TABLE должны быть указаны number и tableType',
            );
          }

          // table: если tableId есть — обновляем, если нет — создаём
          const table = item.tableId
            ? await tx.tables.update({
                where: { id: item.tableId },
                data: {
                  number: item.number,
                  tableType: item.tableType,
                  photo: item.photo ?? null,
                },
              })
            : await tx.tables.create({
                data: {
                  number: item.number,
                  tableType: item.tableType,
                  photo: item.photo ?? null,
                },
              });

          // floor item: если id есть — update, если нет — create
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

        // 2) НЕ TABLE: обычный floor item
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
                tableId: null, // важно: чтобы WC/EXIT/BAR не держали tableId
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

      // 3) Удаляем всё, чего нет в keepFloorItemIds
      // Если пришёл пустой массив — удалим всё (твоя логика сохранена)
      await tx.floorItems.deleteMany({
        where: keepFloorItemIds.length
          ? { id: { notIn: keepFloorItemIds } }
          : {},
      });

      return true;
    });
  }
}
