import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  participant_note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  benefits_note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  opportunities_note?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Ext Icon (jpg, png, svg)',
  })
  icon: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Ext participant_thumbnail (jpg, png, svg)',
  })
  participant_thumbnail: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Ext benefits_thumbnail (jpg, png, svg)',
  })
  benefits_thumbnail: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Ext opportunities_thumbnail (jpg, png, svg)',
  })
  opportunities_thumbnail: any;
}
