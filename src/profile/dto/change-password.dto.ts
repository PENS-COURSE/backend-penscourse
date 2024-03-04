import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  password_old: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password_new: string;

  @ApiProperty()
  @IsNotEmpty()
  password_new_confirm: string;
}
