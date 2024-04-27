import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import UploadModule from '../utils/upload-module.utils';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';

@Module({
  imports: [CoursesModule, UploadModule({ path: 'departments' })],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
