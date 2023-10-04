import { $Enums, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  id: number;
  name: string;
  email: string;
  email_verified_at: Date;
  @Exclude()
  password: string;
  avatar: string;
  role: $Enums.Role;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
}
