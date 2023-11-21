import { $Enums, User } from '@prisma/client';
import { Expose } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @Expose({ groups: ['detail'] })
  google_id: string;

  id: number;

  name: string;

  @Expose({ groups: ['detail'] })
  email: string;

  @Expose({ groups: ['detail'] })
  email_verified_at: Date;

  @Expose({ groups: ['detail'] })
  password: string;

  avatar: string;

  @Expose({ groups: ['detail'] })
  role: $Enums.Role;

  @Expose({ groups: ['detail'] })
  created_at: Date;

  @Expose({ groups: ['detail'] })
  updated_at: Date;
}
