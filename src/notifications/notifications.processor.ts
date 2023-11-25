import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { NotificationByDeviceBuilder } from 'onesignal-api-client-core';

import { Notification } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { Job } from 'bull';
import { OneSignalService } from 'onesignal-api-client-nest';

@Processor('notifications')
export class NotificationsConsumer {
  constructor(private readonly oneSignalService: OneSignalService) {}

  @Process('push-notification-onesignal')
  async pushNotificationOneSignal(job: Job<Notification>) {
    const input = new NotificationByDeviceBuilder()
      .setIncludeExternalUserIds([job.data.user_id.toString()])
      .notification()
      .setHeadings({
        en: job.data.title,
        id: job.data.title,
      })
      .setContents({
        en: job.data.description,
        id: job.data.description,
      })
      .setAttachments({
        data: job.data,
      })
      .build();

    const data = await this.oneSignalService.createNotification(input);

    console.log(data);

    return data;
  }

  @OnQueueFailed()
  async onError(error: Error, job: Job) {
    console.log('=========================================');
    console.log(`Error Push Notificaiton : ${error}`);
    console.log(`Job Detail : ${JSON.stringify(job.data)}`);

    // Sentry
    Sentry.captureException({
      title: 'Error Push Notification',
      error,
      job,
    });

    console.log('=========================================');
  }
}
