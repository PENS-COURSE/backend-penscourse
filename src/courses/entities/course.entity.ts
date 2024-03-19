import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Course } from '@prisma/client';
import { Expose } from 'class-transformer';
import { UserMinimalistEntity } from '../../users/entities/user.entity';

export class CourseEntity implements Course {
  constructor({ user, ...data }: Partial<CourseEntity>) {
    Object.assign(this, data);

    if (user) {
      this.user = new UserMinimalistEntity(user);
    }

    if (user?.role !== 'user') {
      delete this.is_enrolled;
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  is_free: boolean;

  @ApiProperty()
  is_certified: boolean;

  @ApiProperty()
  grade_level: $Enums.GradeLevel;

  @ApiProperty()
  start_date: Date;

  @ApiProperty()
  end_date: Date;

  @ApiProperty()
  max_students: number;

  @ApiProperty()
  thumbnail: string;

  @ApiProperty()
  department_id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  @Expose({ name: 'is_enrolled' })
  is_enrolled: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  user: UserMinimalistEntity;
}
