import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ListStudentsDto } from './dto/list-students.dto';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @ApiCookieAuth('accessToken')
  @Get()
  findAll(@Query() query: ListStudentsDto) {
    return this.studentsService.findAll(query);
  }

  @ApiCookieAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const student = await this.studentsService.findOne(id);
    if (!student)
      throw new NotFoundException(`Student with id ${id} not found`);
    return student;
  }

  @ApiCookieAuth('accessToken')
  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @ApiCookieAuth('accessToken')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    const updatedStudent = await this.studentsService.update(id, dto);
    if (!updatedStudent)
      throw new NotFoundException(`Student with id ${id} not found`);
    return updatedStudent;
  }

  @ApiCookieAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const ok = await this.studentsService.remove(id);
    if (!ok) throw new NotFoundException(`Student with id ${id} not found`);
    return { message: `Студент с id ${id} удалён` };
  }
}
