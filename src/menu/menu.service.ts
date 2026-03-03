import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { ListDishesDto } from './dto/list-dishes.dto';
import { fileToBase64 } from 'src/common/utils/file-to-base64.util';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  getAllCategories() {
    return this.prisma.menuCategory.findMany();
  }

  async createCategory(dto: CreateCategoryDto) {
    const exists = await this.prisma.menuCategory.findUnique({
      where: {
        name: dto.name,
      },
    });
    if (exists) {
      throw new Error('Категория с таким названием уже существует');
    }

    return await this.prisma.menuCategory.create({
      data: dto,
    });
  }

  getAllIngredients() {
    return this.prisma.ingredient.findMany();
  }

  async createIngredient(name: string) {
    const exists = await this.prisma.ingredient.findUnique({
      where: { name },
    });
    if (exists)
      throw new BadRequestException(
        'Ингредиент с таким названием уже существует',
      );

    return await this.prisma.ingredient.create({
      data: { name },
    });
  }

  async createDish(dto: CreateDishDto, photoBase64: string | null) {
    const exists = await this.prisma.dish.findUnique({
      where: { name: dto.name },
    });
    if (exists)
      throw new BadRequestException('Блюдо с таким названием уже существует');

    const dish = await this.prisma.dish.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        photo: photoBase64,
        dishIngredients: {
          create: dto.ingredientsIds.map((ingredientId) => ({
            ingredient: { connect: { id: ingredientId } },
          })),
        },
      },
      include: {
        dishIngredients: {
          include: { ingredient: true }, // чтобы сразу пришли ингредиенты
        },
      },
    });

    return {
      ...dish,
      dishIngredients: dish.dishIngredients.map((di) => di.ingredient),
    };
  }

  async getAllDishes(query: ListDishesDto) {
    const { categoryId, search, page = 1, limit = 10, sort = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId !== undefined && categoryId !== null) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.name = { contains: search };
    }

    const dishes = await this.prisma.dish.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: sort },
      include: {
        dishIngredients: {
          include: { ingredient: true },
        },
      },
    });

    return dishes.map((dish) => ({
      ...dish,
      dishIngredients: dish.dishIngredients.map((di) => di.ingredient),
    }));
  }
}
