import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Course, Order } from '@prisma/client';
import { instanceToPlain } from 'class-transformer';
import { UserEntity } from '../users/entities/user.entity';

export class OrderEntity implements Order {
  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);

    if (this.user) {
      this.user = instanceToPlain(new UserEntity(this.user), {
        groups: ['detail'],
      });
    } else {
      delete this.user;
    }
  }

  xendit_id: string;

  status: $Enums.PaymentStatusType;

  id: string;
  user_id: number;
  course_id: number;
  total_price: number;
  total_discount: number;
  user: any;
  course: Course;

  created_at: Date;
  updated_at: Date;
}

export class OrderWithPayment extends OrderEntity {
  constructor({ payment, ...data }: Partial<OrderWithPayment>) {
    super(data);

    if (data.status === 'pending' && payment) {
      this.payment = new Payment(payment);
    } else {
      delete this.payment;
    }
  }

  payment?: Payment;
}

export class Payment {
  constructor(partial: Partial<Payment>) {
    this.id = partial.id;
    this.status = partial.status;
    this.expiry_date = partial.expiry_date;
    this.invoice_url = partial.invoice_url;
  }

  @ApiProperty()
  id?: string;

  @ApiProperty()
  status?: string;

  @ApiProperty()
  expiry_date?: Date;

  @ApiProperty()
  invoice_url?: string;
}
