import { ApiProperty } from '@nestjs/swagger';
import { CertificateType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GenerateCertificateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  course_slug: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  minimum_duration_liveclass?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  minimum_daily_quiz_score?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
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
