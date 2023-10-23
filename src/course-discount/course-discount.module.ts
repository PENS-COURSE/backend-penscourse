import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { CourseDiscountController } from './course-discount.controller';
import { CourseDiscountService } from './course-discount.service';

@Module({
  imports: [CoursesModule],
  controllers: [CourseDiscountController],
  providers: [CourseDiscountService],
})
export class CourseDiscountModule {}
