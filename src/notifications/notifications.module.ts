import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { OneSignalModule } from 'onesignal-api-client-nest';
import { UsersModule } from '../users/users.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsConsumer } from './notifications.processor';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: 'notifications' }),
    OneSignalModule.forRootAsync({
      inject: [PrismaService],
      useFactory: async (prisma: PrismaService) => {
        const oneSignal = await prisma.dynamicConfigurations.findFirst({
          where: {
            title: 'OneSignal',
          },
          include: {
            DynamicConfigurationValues: true,
          },
        });

        return {
          appId:
            oneSignal?.DynamicConfigurationValues.find(
              (value) => value.key === 'ONESIGNAL_APP_ID',
            )?.value ?? process.env.ONESIGNAL_APP_ID,
          restApiKey:
            oneSignal?.DynamicConfigurationValues.find(
              (value) => value.key === 'ONESIGNAL_APP_KEY',
            )?.value ?? process.env.ONESIGNAL_APP_KEY,
        };
      },
    }),
    UsersModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsConsumer],
  exports: [NotificationsService],
})
export class NotificationsModule {}
