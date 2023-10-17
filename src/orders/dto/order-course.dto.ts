import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class OrderCourseDto {
  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  payment_id: number;
}
