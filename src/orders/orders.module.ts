import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [CoursesModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
