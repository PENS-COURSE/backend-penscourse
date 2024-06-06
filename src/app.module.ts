import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as Joi from 'joi';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { BannersModule } from './banners/banners.module';
import { CertificatesModule } from './certificates/certificates.module';
import { CommonModule } from './common/common.module';
import { CourseDiscountModule } from './course-discount/course-discount.module';
import { CoursesModule } from './courses/courses.module';
import { DepartmentsModule } from './departments/departments.module';
import { DynamicConfigurationsModule } from './dynamic-configurations/dynamic-configurations.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { LiveClassModule } from './live-class/live-class.module';
import { LogoModule } from './logo/logo.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaConfigService } from './prisma/prisma-config.service';
import { ProfileModule } from './profile/profile.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { StreamingModule } from './streaming/streaming.module';
import { UsersModule } from './users/users.module';
import { CacheManagerModule } from './utils/cache-manager/cache-manager.module';
import { RolesGuard } from './utils/guards/roles.guard';
import { EventModule } from './utils/library/event/event.module';
import { LivekitModule } from './utils/library/livekit/livekit.module';
import { VouchersModule } from './vouchers/vouchers.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useClass: PrismaConfigService,
    }),
    UsersModule,
    AuthenticationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    ProfileModule,
    DepartmentsModule,
    CoursesModule,
    OrdersModule,
    EnrollmentsModule,
    CourseDiscountModule,
    MailModule,
    ServeStaticModule.forRoot({
      rootPath: './public',
      exclude: ['/api*'],
      serveRoot: '/public',
      renderPath: '/public',
    }),
    CommonModule,
    QuizzesModule,
    NotificationsModule,
    LivekitModule,
    StreamingModule,
    BannersModule,
    EventModule,
    CertificatesModule,
    LogoModule,
    CacheManagerModule,
    DynamicConfigurationsModule,
    VouchersModule,
    LiveClassModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
