import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateQuizQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  question: string;

  @ApiProperty()
  @IsNotEmpty()
  option_a: string;

  @ApiProperty()
  @IsNotEmpty()
  option_b: string;

  @ApiPropertyOptional()
  @IsOptional()
  option_c?: string;

  @ApiPropertyOptional()
  @IsOptional()
  option_d?: string;

  @ApiPropertyOptional()
  @IsOptional()
  option_e?: string;

  @ApiProperty({ enum: $Enums.QuestionType })
  @IsEnum($Enums.QuestionType)
  question_type: $Enums.QuestionType;

  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  right_answer: string[];

  @ApiProperty({ enum: $Enums.Level })
  @IsEnum($Enums.Level)
  level: $Enums.Level;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  curriculum_uuid?: string;
}

export class UpdateQuizQuestionDto extends PartialType(CreateQuizQuestionDto) {}

export class CreateQuizQuestionCSVDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
