import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { Queue } from 'bull';
import { OneSignalService } from 'onesignal-api-client-nest';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly oneSignalService: OneSignalService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  async findAll({ user }: { user: User }) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        user_id: user.id,
      },
    });

    return notifications;
  }

  async findOne({
    user,
    notification_uuid,
    throwException = true,
  }: {
    user: User;
    notification_uuid: string;
    throwException?: boolean;
  }) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        user_id: user.id,
        id: notification_uuid,
      },
    });

    if (!notification && throwException) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    return notification;
  }

  async markAsRead({
    user,
    notification_uuid,
  }: {
    user: User;
    notification_uuid: string;
  }) {
    const notification = await this.findOne({
      user,
      notification_uuid,
    });

    const updatedNotification = await this.prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        read_at: new Date(),
      },
    });

    return updatedNotification;
  }

  async markAllAsRead({ user }: { user: User }) {
    const notifications = await this.findAll({ user });

    const updatedNotifications = await this.prisma.notification.updateMany({
      where: {
        id: {
          in: notifications.map((notification) => notification.id),
        },
      },
      data: {
        read_at: new Date(),
      },
    });

    return updatedNotifications;
  }

  async sendNotification({
    user_ids,
    type,
    title,
    body,
    action_id,
  }: {
    user_ids: number[];
    type: string;
    title: string;
    body: string;
    action_id?: string;
  }) {
    return await Promise.all(
      user_ids.map(async (user_id) => {
        const user = await this.userService.findOneByID(user_id);

        const notification = await this.prisma.notification.create({
          data: {
            user_id: user.id,
            type,
            title,
            description: body,
            action_id: action_id || null,
          },
        });

        await this.notificationQueue.add(
          'push-notification-onesignal',
          notification,
        );

        return notification;
      }),
    );
  }
}
