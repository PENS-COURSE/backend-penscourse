import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { CourseDiscountModule } from './course-discount/course-discount.module';
import { CoursesModule } from './courses/courses.module';
import { DepartmentsModule } from './departments/departments.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
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
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
