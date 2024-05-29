import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class ReviewsDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1, {
    message: 'Rating tidak boleh kurang dari 1',
  })
  @Max(5, {
    message: 'Rating tidak boleh lebih dari 5',
  })
  rating: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  comment: string;
}
