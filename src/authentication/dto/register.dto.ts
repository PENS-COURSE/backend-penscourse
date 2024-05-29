import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
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
}
