import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { CoursesService } from '../courses/courses.service';
import { OrderEntity } from '../entities/order.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentHelpers } from '../utils/payment.utils';
import { OrderCourseDto } from './dto/order-course.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly course: CoursesService,
    private readonly configService: ConfigService,
  ) {}

  async findAll({ user }: { user: User }) {
    const orders = await this.prisma.order.findMany({
      include: {
        course: true,
        payment: true,
        user: true,
      },
      where: {
        user_id: user?.id,
      },
    });

    return orders.map((order) => new OrderEntity({ ...order }));
  }

  async findOne({
    orderId,
    user,
    throwException = true,
  }: {
    orderId: string;
    user: User;
    throwException?: boolean;
  }) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: user.id,
      },
    });

    if (throwException && !order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async orderCourse({
    courseSlug,
    user,
    payload,
  }: {
    courseSlug: string;
    user: User;
    payload: OrderCourseDto;
  }) {
    const course = await this.course.findOneBySlug(courseSlug);

    if (course.is_free) {
      throw new BadRequestException('Course is free');
    }

    if (!course.is_active) {
      throw new ForbiddenException();
    }

    return await this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.create({
          data: {
            course_id: course.id,
            user_id: user.id,
            total_price: course.price,
          },
        });

        const payment = await PaymentHelpers.createOrder({
          payment_id: payload.payment_id,
          gross_amount: course.price,
          order_uuid: order.id,
          user,
        });

        await tx.payment.create({
          data: {
            order_id: order.id,
            gross_amount: order.total_price,
            payment_method: payment.namePayment,
            payment_type: payment.response.payment_type,
            transaction_id: payment.response.transaction_id,
            actions: payment.response.actions,
            expiry_time: payment.response.expiry_time,
            status: payment.response.transaction_status,
            va_numbers_bank:
              payment.response.va_numbers != null
                ? payment.response.va_numbers[0]['bank']
                : null,
            va_numbers_va:
              payment.response.va_numbers != null
                ? payment.response.va_numbers[0]['va_number']
                : null,
          },
        });

        return await tx.order.findFirst({
          where: {
            id: order.id,
          },
          include: {
            payment: true,
          },
        });
      },
      {
        timeout: 20000,
      },
    );
  }

  async handleMidtransNotifications(body: any) {
    const orderId = body.order_id;
    const statusCode = body.status_code;
    const grossAmount = body.gross_amount;
    const serverKey = this.configService.get('MIDTRANS_SERVER_KEY');

    const hash = crypto.createHash('sha512');
    const signatureKey = hash
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`, 'utf8')
      .digest('hex');

    if (signatureKey !== body.signature_key) {
      throw new BadRequestException('Invalid signature key');
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        transaction_id: body.transaction_id,
      },
    });

    const order = await this.prisma.order.findFirst({
      where: {
        id: payment.order_id,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.prisma.payment.update({
      where: {
        order_id: order.id,
      },
      data: {
        status: body.transaction_status,
      },
    });

    if (body.transaction_status === 'settlement') {
      await this.prisma.enrollment.create({
        data: {
          user_id: order.user_id,
          course_id: order.course_id,
        },
      });
    }

    return 'OK';
  }
}
