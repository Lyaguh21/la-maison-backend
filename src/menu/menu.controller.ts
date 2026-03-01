import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { ListDishesDto } from './dto/list-dishes.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @ApiOperation({ summary: 'Получение всех категорий меню (Все)' })
  @Get('categories')
  getAllCategories() {
    return this.menu.getAllCategories();
  }

  @ApiOperation({ summary: 'Создание категории меню (Админ)' })
  @Roles('ADMIN')
  @Post('category')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.menu.createCategory(dto);
  }

  @ApiOperation({ summary: 'Получение всех ингредиентов (Все)' })
  @Get('ingredients')
  getAllIngredients() {
    return this.menu.getAllIngredients();
  }

  @ApiOperation({ summary: 'Создание ингредиента (Админ)' })
  @Roles('ADMIN')
  @Post('ingredient')
  createIngredient(@Body() dto: CreateIngredientDto) {
    return this.menu.createIngredient(dto.name);
  }

  @ApiOperation({ summary: 'Получение всех блюд (Все)' })
  @Get('dishes')
  getAllDishes(@Query() query: ListDishesDto) {
    return this.menu.getAllDishes(query);
  }

  @ApiOperation({ summary: 'Создание блюда в категории меню (Админ)' })
  @Roles('ADMIN')
  @Post('dish')
  createDish(@Body() dto: CreateDishDto) {
    return this.menu.createDish(dto);
  }
}
