import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums, User } from '@prisma/client';
import * as crypto from 'crypto';
import * as moment from 'moment';
import { CoursesService } from '../courses/courses.service';
import { OrderEntity } from '../entities/order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginator } from '../utils/pagination.utils';
import { PaymentHelpers } from '../utils/payment.utils';
import { NotificationType, notificationWording } from '../utils/wording.utils';
import { OrderCourseDto } from './dto/order-course.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly course: CoursesService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationsService,
  ) {}

  async findAll({
    page = 1,
    user,
    filterByStatus,
  }: {
    page: number;
    user: User;
    filterByStatus?: $Enums.PaymentStatusType;
  }) {
    const pagination = createPaginator({ perPage: 25 });

    return await pagination({
      model: this.prisma.order,
      args: {
        where: {
          user_id: user?.id,
          payment: {
            status: filterByStatus || undefined,
          },
        },
        include: {
          user: true,
          course: true,
          payment: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      },
      options: {
        page,
      },
      map: async (orders) =>
        orders.map((order) => new OrderEntity({ ...order })),
    });
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
      include: {
        course: true,
        payment: true,
        user: true,
      },
    });

    if (throwException && !order) {
      throw new NotFoundException('Order not found');
    }

    return new OrderEntity({ ...order });
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
    const course = await this.course.findOneBySlug({ slug: courseSlug });

    if (course.is_free) {
      throw new BadRequestException('Course ini gratis');
    }

    if (!course.is_active) {
      throw new ForbiddenException();
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        course_id: course.id,
        user_id: user.id,
      },
    });

    if (enrollment) {
      throw new BadRequestException('Anda sudah memiliki course ini');
    }

    return await this.prisma.$transaction(
      async (tx) => {
        const isDiscount = await tx.courseDiscount.findFirst({
          where: {
            course_id: course.id,
          },
        });

        if (isDiscount) {
          if (moment().isBefore(isDiscount.start_date)) {
            throw new BadRequestException('Diskon belum dimulai');
          } else if (moment().isAfter(isDiscount.end_date)) {
            throw new BadRequestException('Diskon sudah berakhir');
          } else if (!isDiscount.is_active) {
            throw new BadRequestException('Diskon sudah tidak aktif');
          }
        }

        const order = await tx.order.create({
          data: {
            course_id: course.id,
            user_id: user.id,
            total_price: isDiscount ? isDiscount.discount_price : course.price,
            total_discount: isDiscount
              ? course.price - isDiscount.discount_price
              : null,
          },
        });

        if (order) {
          const payment = await PaymentHelpers.createOrder({
            payment_id: payload.payment_id,
            gross_amount: isDiscount ? isDiscount.discount_price : course.price,
            order_uuid: order.id,
            user,
          });

          if (!payment) {
            const wording = notificationWording(
              NotificationType.transaction_error_payment,
            );

            await this.notificationService.sendNotification({
              user_ids: [order.user_id],
              title: wording.title,
              body: wording.body,
              type: wording.type,
            });

            throw new BadRequestException('Order gagal dibuat');
          }

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

          const wording = notificationWording(
            NotificationType.transaction_waiting_payment,
          );

          await this.notificationService.sendNotification({
            user_ids: [order.user_id],
            title: wording.title,
            body: wording.body,
            type: wording.type,
            action_id: order.id,
          });

          return await tx.order.findFirst({
            where: {
              id: order.id,
            },
            include: {
              payment: true,
              course: true,
            },
          });
        } else {
          const wording = notificationWording(
            NotificationType.transaction_error_payment,
          );

          await this.notificationService.sendNotification({
            user_ids: [order.user_id],
            title: wording.title,
            body: wording.body,
            type: wording.type,
          });

          throw new BadRequestException('Order gagal dibuat');
        }
      },
      {
        timeout: 60000,
        maxWait: 60000,
      },
    );
  }

  async handleMidtransNotifications(body: any) {
    const orderId = body?.order_id;
    const statusCode = body?.status_code;
    const grossAmount = body?.gross_amount;

    const serverKey = this.configService.get('MIDTRANS_SERVER_KEY');

    const hash = crypto.createHash('sha512');
    const signatureKey = hash
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`, 'utf8')
      .digest('hex');

    if (signatureKey !== body?.signature_key) {
      throw new BadRequestException('Invalid signature key');
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        transaction_id: body?.transaction_id,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: payment.order_id,
      },
      include: {
        course: true,
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
        status: body?.transaction_status,
      },
    });

    if (body?.transaction_status === 'settlement') {
      await this.prisma.enrollment.create({
        data: {
          user_id: order.user_id,
          course_id: order.course_id,
        },
      });

      const wording = notificationWording(
        NotificationType.transaction_success_payment,
      );

      await this.notificationService.sendNotification({
        user_ids: [order.user_id],
        title: wording.title,
        body: wording.body,
        type: wording.type,
        action_id: order.course.slug,
      });
    }

    return 'OK';
  }
}
