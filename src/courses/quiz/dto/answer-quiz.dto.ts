import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AnswerQuizDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  session_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  answer: string[];
}

export class QuizDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  answer: string[];
}

export class AnswersQuizDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  session_id: string;

  @ApiProperty({ type: QuizDto, isArray: true })
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested()
  @Type(() => QuizDto)
  answers: QuizDto[];
}
