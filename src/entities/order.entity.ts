import { Course, Order, Payment } from '@prisma/client';
import { instanceToPlain } from 'class-transformer';
import { UserEntity } from './user.entity';

export class OrderEntity implements Order {
  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);

    this.user = instanceToPlain(new UserEntity(this.user), {
      groups: ['detail'],
    });
  }

  id: string;
  user_id: number;
  course_id: number;
  total_price: number;
  total_discount: number;
  user: any;
  course: Course;
  payment: Payment;
  created_at: Date;
  updated_at: Date;
}
