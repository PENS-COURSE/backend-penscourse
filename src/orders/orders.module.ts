import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { XenditModule } from '../utils/library/xendit/xendit.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    CoursesModule,
    XenditModule.register({
      XENDIT_API_KEY: process.env.XENDIT_API_KEY,
      SUCCESS_REDIRECT_URL: process.env.XENDIT_SUCCESS_REDIRECT_URL,
      FAILURE_REDIRECT_URL: process.env.XENDIT_FAILURE_REDIRECT_URL,
      LOCALE: 'id',
      CURRENCY: 'IDR',
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
