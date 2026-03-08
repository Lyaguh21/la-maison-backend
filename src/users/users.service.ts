import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from 'src/auth/types/auth-user.type';
import { Prisma } from '@prisma/client';
import { ListUsersDto } from './dto/list-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(query: ListUsersDto) {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const search = query.search?.trim();
    const sort = query.sort || 'asc';
    const filter = query.filter || 'ALL';

    const roleFilter =
      filter && filter !== 'ALL' ? { role: { equals: filter as Role } } : {};

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const where = { AND: [roleFilter, searchFilter] };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { email: sort },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,

          userAllergens: {
            select: { id: true, name: true },
          },
        },
      }),

      this.prisma.user.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  private readonly userSelectFields = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    createdAt: true,
    updatedAt: true,
    userAllergens: {
      select: { id: true, name: true },
    },
  };

  async getOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelectFields,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async updateRole(params: { userId: number; role: Role }) {
    const { userId, role } = params;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) throw new BadRequestException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role,
        hashedRefreshToken: null, // ключевое: выкидываем со всех устройств
        tokenVersion: { increment: 1 },
      },
      select: this.userSelectFields,
    });

    return updated;
  }

  async updateProfile(params: {
    userId: number;
    name?: string;
    phone?: string;
    userAllergenIds?: number[];
  }) {
    const { name, phone, userId, userAllergenIds } = params;
    if (!name && !phone && userAllergenIds === undefined) {
      throw new BadRequestException('At least one field must be provided');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        ...(userAllergenIds !== undefined && {
          userAllergens: {
            set: userAllergenIds.map((id) => ({ id })),
          },
        }),
      },
      select: this.userSelectFields,
    });

    return updated;
  }
}
