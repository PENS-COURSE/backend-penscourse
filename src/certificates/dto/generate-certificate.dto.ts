import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GenerateCertificateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  course_slug: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minimum_duration_liveclass?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minimum_daily_quiz_score?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minimum_final_quiz_score?: number;

  @ApiProperty({ type: [Number], isArray: true })
  @IsArray()
  @IsNotEmpty()
  list_participant_ids: number[];

  @ApiProperty({ type: [String], isArray: true })
  @IsArray()
  @IsNotEmpty()
  list_final_quiz_ids: String[];

  @ApiProperty({ type: [String], isArray: true })
  @IsArray()
  @IsNotEmpty()
  list_daily_quiz_ids: String[];

  @ApiProperty({ type: [String], isArray: true, enum: CertificateType })
  @IsArray()
  @IsNotEmpty()
  certificate_type: CertificateType[];
}
