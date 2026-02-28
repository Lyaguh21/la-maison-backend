import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  @IsOptional()
  @MinLength(4)
  email: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(99)
  age: number;
}
