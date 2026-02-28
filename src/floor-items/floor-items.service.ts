import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateObjectDto } from './dto/create-object.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateObjectDto } from './dto/update-object.dto';

@Injectable()
export class FloorItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async createObject(dto: CreateObjectDto) {
    if (dto.type === 'TABLE') {
      const existingTable = await this.prisma.tables.findUnique({
        where: { number: dto.number },
      });

      if (existingTable) {
        throw new BadRequestException('Стол с таким номером уже существует');
      }

      const table = await this.prisma.tables.create({
        data: {
          number: dto.number,
          tableType: dto.tableType,
          photo: dto.photo,
        },
        select: {
          id: true,
          number: true,
          tableType: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const floorItem = await this.prisma.floorItems.create({
        data: {
          type: 'TABLE',
          tableId: table.id,
          x: dto.x,
          y: dto.y,
          height: dto.height,
          width: dto.width,
          rotation: dto.rotation,
        },
        select: {
          id: true,
          type: true,
          tableId: true,
          x: true,
          y: true,
          height: true,
          width: true,
          rotation: true,
        },
      });

      return { table, floorItem };
    } else {
      return await this.prisma.floorItems.create({
        data: {
          x: dto.x,
          y: dto.y,
          height: dto.height,
          width: dto.width,
          rotation: dto.rotation,
          type: dto.type,
        },
        select: {
          id: true,
          type: true,
          x: true,
          y: true,
          height: true,
          width: true,
          rotation: true,
        },
      });
    }
  }

  async updateObject(dto: UpdateObjectDto) {
    if (dto.tableId) {
      const existingTable = await this.prisma.tables.findUnique({
        where: { id: dto.tableId },
      });

      if (!existingTable) {
        throw new BadRequestException('Стола с таким id не существует');
      }

      const table = await this.prisma.tables.update({
        where: { id: dto.tableId },
        data: {
          number: dto.number,
          photo: dto.photo,
        },
        select: {
          id: true,
          number: true,
          tableType: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const floorItem = await this.prisma.floorItems.update({
        where: { id: dto.objectId },
        data: {
          x: dto.x,
          y: dto.y,
          height: dto.height,
          width: dto.width,
          rotation: dto.rotation,
        },
        select: {
          id: true,
          type: true,
          tableId: true,
          x: true,
          y: true,
          height: true,
          width: true,
          rotation: true,
        },
      });

      return { table, floorItem };
    } else {
      return await this.prisma.floorItems.update({
        where: { id: dto.objectId },
        data: {
          x: dto.x,
          y: dto.y,
          height: dto.height,
          width: dto.width,
          rotation: dto.rotation,
        },
        select: {
          id: true,
          type: true,
          x: true,
          y: true,
          height: true,
          width: true,
          rotation: true,
        },
      });
    }
  }

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
}
