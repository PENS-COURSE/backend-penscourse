import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        appId: configService.get<string>('ONESIGNAL_APP_ID'),
        restApiKey: configService.get<string>('ONESIGNAL_APP_KEY'),
      }),
    }),
    UsersModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsConsumer],
  exports: [NotificationsService],
})
export class NotificationsModule {}
