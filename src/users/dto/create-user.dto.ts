import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  password_confirmation: string;

  avatar?: string;

  @ApiProperty({ enum: $Enums.Role })
  @IsNotEmpty()
  @IsEnum($Enums.Role)
  role: $Enums.Role;
}
