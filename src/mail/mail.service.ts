import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private readonly mailQueue: Queue) {}

  async sendMail<T>({
    data,
    template,
    to,
    subject,
  }: {
    data: T;
    template: string;
    to: string;
    subject: string;
  }) {
    const mail = await this.mailQueue.add('sendMail', {
      data,
      template,
      to,
      subject,
    });

    return mail;
  }
}
