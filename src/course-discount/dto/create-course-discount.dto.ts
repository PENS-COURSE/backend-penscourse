import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCourseDiscountDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  course_slug: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  discount_price: number;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start_date: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end_date: Date;

  @ApiPropertyOptional({ type: Boolean, nullable: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active: boolean;
}
