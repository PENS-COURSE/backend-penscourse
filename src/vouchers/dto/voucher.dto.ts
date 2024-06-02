import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DiscountType, Prisma } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVoucherDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  discount_amount: Prisma.Decimal;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  @IsNotEmpty()
  discount_type: DiscountType;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  min_purchase: Prisma.Decimal;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  max_discount?: number;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  end_date: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  usage_limit?: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {}

export class ApplyVoucherDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  order_id: string;
}
