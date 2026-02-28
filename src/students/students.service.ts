import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ListStudentsDto } from './dto/list-students.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ListStudentsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search?.trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),

      this.prisma.student.count({ where }),
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

  findOne(id: number) {
    return this.prisma.student.findUnique({ where: { id } });
  }

  create(dto: CreateStudentDto) {
    return this.prisma.student.create({ data: dto });
  }

  async update(id: number, dto: UpdateStudentDto) {
    return this.prisma.student.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.prisma.student.delete({ where: { id } });
    return true;
  }
}
