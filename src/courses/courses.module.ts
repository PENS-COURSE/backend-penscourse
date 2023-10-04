import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CurriculumsController } from './curriculums/curriculums.controller';
import { CurriculumsService } from './curriculums/curriculums.service';
import { SubjectsController } from './curriculums/subjects/subjects.controller';
import { SubjectsService } from './curriculums/subjects/subjects.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './public/uploads/courses',
      storage: diskStorage({
        destination: './public/uploads/courses',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${file.originalname}`);
        },
      }),
    }),
  ],
  controllers: [CurriculumsController, SubjectsController, CoursesController],
  providers: [CoursesService, CurriculumsService, SubjectsService],
  exports: [CoursesService],
})
export class CoursesModule {}
