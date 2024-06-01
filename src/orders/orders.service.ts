import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums, User } from '@prisma/client';
import * as moment from 'moment';
import { PrismaService } from 'nestjs-prisma';
import { CoursesService } from '../courses/courses.service';
import { OrderEntity, OrderWithPayment } from '../entities/order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Xendit } from '../utils/library/xendit/entity/xendit.entity';
import { XenditService } from '../utils/library/xendit/xendit.service';
import { createPaginator } from '../utils/pagination.utils';
import { NotificationType, notificationWording } from '../utils/wording.utils';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly course: CoursesService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationsService,
    private readonly xenditService: XenditService,
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
          status: filterByStatus || undefined,
        },
        include: {
          user: true,
          course: true,
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
        user: true,
      },
    });

    if (throwException && !order) {
      throw new NotFoundException('Order not found');
    }

    let payment: Xendit;

    if (order.status === 'pending') {
      payment = await this.xenditService.getInvoice(order.xendit_id);
    }

    return new OrderWithPayment({ payment, ...order });
  }

  async orderCourse({ courseSlug, user }: { courseSlug: string; user: User }) {
    const course = await this.course.checkIsEnrollment({ courseSlug, user });

    if (course.is_free) {
      throw new BadRequestException('Course ini gratis');
    }

    return await this.prisma.$transaction(
      async (tx) => {
        const isDiscount = await tx.courseDiscount.findFirst({
          where: {
            course_id: course.id,
          },
        });

        const isDiscountValid =
          isDiscount &&
          moment().isBefore(isDiscount.end_date) &&
          moment().isAfter(isDiscount.start_date) &&
          isDiscount.is_active;

        const order = await tx.order.create({
          data: {
            status: 'pending',
            course_id: course.id,
            user_id: user.id,
            total_price: isDiscountValid
              ? isDiscount.discount_price
              : course.price,
            total_discount: isDiscountValid
              ? course.price - isDiscount.discount_price
              : null,
          },
        });

        if (order) {
          const payment = await this.xenditService.createSNAP({
            amount: isDiscountValid ? isDiscount.discount_price : course.price,
            course: course,
            user: user,
            description: `Pembelian course ${course.name}`,
            externalId: order.id,
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

          await tx.order.update({
            where: {
              id: order.id,
            },
            data: {
              xendit_id: payment.id,
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

          const data = await tx.order.findFirst({
            where: {
              id: order.id,
            },
            include: {
              course: true,
            },
          });

          return new OrderWithPayment({ payment, ...data });
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

  async handleNotification(body: any) {
    const notification = await this.xenditService.handleNotification(body);

    const order = await this.findOneByXenditId(notification.id);

    await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: notification.status.toLowerCase() as any,
      },
    });

    if (notification.status === 'PAID') {
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

  private async findOneByXenditId(xenditId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        xendit_id: xenditId,
      },
      include: {
        course: true,
      },
    });

    if (!order) throw new NotFoundException('Order tidak ditemukan');

    return order;
  }
}
