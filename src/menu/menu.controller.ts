import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { ListDishesDto } from './dto/list-dishes.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileToBase64 } from 'src/common/utils/file-to-base64.util';

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

  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Создание блюда в категории меню (Админ)' })
  @Roles('ADMIN')
  @Post('dish')
  createDish(
    @Body() dto: CreateDishDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoBase64 = file ? fileToBase64(file) : null;

    return this.menu.createDish(dto, photoBase64);
  }
}
