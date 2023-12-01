import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class QuizGeneratorDto {
  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  easy_percentage: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  medium_percentage: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  hard_percentage: number;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value == true || value == 'true')
  all_curriculum_questions: boolean;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  total_questions: number;
}

export class CreateQuizDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: 'number', description: 'duration in minutes' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  duration: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start_date?: string | Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date?: string | Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value == true || value == 'true')
  show_result?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pass_grade?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  curriculum_uuid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  course_slug: string;

  @ApiProperty()
  @Type(() => QuizGeneratorDto)
  @ValidateNested()
  generated_questions: QuizGeneratorDto;
}

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: 'number', description: 'duration in minutes' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  duration: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start_date?: string | Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date?: string | Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value == true || value == 'true')
  show_result?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pass_grade?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  curriculum_uuid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  course_slug: string;

  @ApiProperty()
  @Type(() => QuizGeneratorDto)
  @ValidateNested()
  generated_questions: QuizGeneratorDto;

  @ApiProperty({
    type: 'boolean',
    description: 'is_ended is true when quiz is ended',
  })
  @IsBoolean()
  @Transform(({ value }) => value == true || value == 'true')
  is_ended?: boolean;

  @ApiProperty({
    type: 'boolean',
    description: 'is_active is true when quiz is active',
  })
  @IsBoolean()
  @Transform(({ value }) => value == true || value == 'true')
  is_active?: boolean;
}
