import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateLiveClassDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meet_url: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  start_date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  end_date?: Date;
}
