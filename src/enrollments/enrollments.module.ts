import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({
  imports: [CoursesModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
