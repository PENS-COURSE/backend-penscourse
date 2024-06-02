import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('mail')
export class MailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process('sendMail')
  async sendMail<T>(
    job: Job<{
      data: T;
      template: string;
      to: string;
      subject: string;
    }>,
  ) {
    const mail = await this.mailerService.sendMail({
      to: job.data.to,
      subject: job.data.subject,
      template: `./${job.data.template}`,
      context: job.data.data,
    });

    return mail;
  }
}
