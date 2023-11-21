import { Module, forwardRef } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { QuestionsController } from './questions/questions.controller';
import { QuestionsService } from './questions/questions.service';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
  imports: [forwardRef(() => CoursesModule)],
  controllers: [QuestionsController, QuizzesController],
  providers: [QuizzesService, QuestionsService],
  exports: [QuizzesService, QuestionsService],
})
export class QuizzesModule {}
