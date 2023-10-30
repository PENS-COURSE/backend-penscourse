import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

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
    await this.mailerService.sendMail({
      to,
      subject,
      template: `./${template}`,
      context: data,
    });
  }
}
