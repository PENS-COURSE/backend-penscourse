import { Module, forwardRef } from '@nestjs/common';
import { QuizzesModule } from '../quizzes/quizzes.module';
import UploadModule from '../utils/upload-module.utils';
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
    UploadModule({
      path: 'courses',
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
