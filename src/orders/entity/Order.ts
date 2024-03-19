import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Order } from '@prisma/client';
import { UserMinimalistEntity } from '../../users/entities/user.entity';

export class OrderEntity implements Order {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  user: UserMinimalistEntity;

  @ApiProperty()
  course_id: number;

  @ApiProperty()
  total_price: number;

  @ApiProperty()
  total_discount: number;

  @ApiProperty()
  xendit_id: string;

  @ApiProperty()
  status: $Enums.PaymentStatusType;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
