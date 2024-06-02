import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { join } from 'path';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: 'mail' }),
    MailerModule.forRootAsync({
      useFactory: async (prisma: PrismaService) => {
        const mail = await prisma.dynamicConfigurations.findFirst({
          where: {
            title: 'Mail',
          },
          include: {
            DynamicConfigurationValues: true,
          },
        });

        return {
          transport: {
            service:
              mail?.DynamicConfigurationValues.find(
                (value) => value.key === 'MAIL_SERVICE',
              )?.value ?? process.env.MAIL_SERVICE,
            auth: {
              user:
                mail?.DynamicConfigurationValues.find(
                  (value) => value.key === 'MAIL_USER',
                )?.value ?? process.env.MAIL_USER,
              pass:
                mail?.DynamicConfigurationValues.find(
                  (value) => value.key === 'MAIL_PASSWORD',
                )?.value ?? process.env.MAIL_PASSWORD,
            },
          },
          defaults: {
            from: mail?.DynamicConfigurationValues.find(
              (value) => value.key === 'MAIL_FROM',
            )?.value,
          },
          template: {
            dir: join(__dirname, '..', '..', 'mail/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [PrismaService],
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
