import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CurriculumsController } from './curriculums/curriculums.controller';
import { CurriculumsService } from './curriculums/curriculums.service';
import { SubjectsController } from './curriculums/subjects/subjects.controller';
import { SubjectsService } from './curriculums/subjects/subjects.service';
import { QuizController } from './quiz/quiz.controller';
import { QuizService } from './quiz/quiz.service';

@Module({
  imports: [
    forwardRef(() => QuizzesModule),
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
  controllers: [
    CurriculumsController,
    SubjectsController,
    QuizController,
    CoursesController,
  ],
  providers: [CoursesService, CurriculumsService, SubjectsService, QuizService],
  exports: [CoursesService, CurriculumsService, SubjectsService],
})
export class CoursesModule {}
