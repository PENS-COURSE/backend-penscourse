import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddVideoContentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  video_url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  duration?: string;
}
