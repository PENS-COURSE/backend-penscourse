import { ApiProperty, PartialType } from '@nestjs/swagger';
import { DynamicConfigurationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateDynamicConfigurationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateDynamicConfigurationDto extends PartialType(
  CreateDynamicConfigurationDto,
) {}

export class DynamicConfigurationValuesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    enum: DynamicConfigurationType,
  })
  @IsEnum(DynamicConfigurationType)
  @IsNotEmpty()
  type: DynamicConfigurationType;
}

export class CreateDynamicConfigurationValuesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    enum: DynamicConfigurationType,
  })
  @IsEnum(DynamicConfigurationType)
  @IsNotEmpty()
  type: DynamicConfigurationType;
}

export class UpdateDynamicConfigurationValuesDto extends PartialType(
  CreateDynamicConfigurationValuesDto,
) {}
