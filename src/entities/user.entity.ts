import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @Expose({ groups: ['detail'] })
  @ApiProperty()
  google_id: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @Expose({ groups: ['detail'] })
  @ApiProperty()
  email: string;

  @Expose({ groups: ['detail'] })
  @ApiProperty()
  email_verified_at: Date;

  @Exclude()
  @ApiProperty()
  password: string;

  @ApiProperty()
  avatar: string;

  @Expose({ groups: ['detail'] })
  @ApiProperty()
  role: $Enums.Role;

  @Expose({ groups: ['detail'] })
  @ApiProperty()
  created_at: Date;

  @Expose({ groups: ['detail'] })
  @ApiProperty()
  updated_at: Date;
}

export class UserMinimalistEntity implements User {
  constructor(partial: Partial<UserMinimalistEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  email: string;
  @Exclude()
  email_verified_at: Date;
  @Exclude()
  google_id: string;
  @Exclude()
  password: string;
  @Exclude()
  role: $Enums.Role;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  avatar: string;
}
