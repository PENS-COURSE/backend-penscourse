import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddLiveClassDto {
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
