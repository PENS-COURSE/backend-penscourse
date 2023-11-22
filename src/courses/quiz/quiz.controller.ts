import { Body, Controller, Get, HttpCode, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../authentication/decorators/current-user.decorators';
import { AnswerQuizDto } from './dto/answer-quiz.dto';
import { QuizService } from './quiz.service';

@ApiTags('Course - Quiz')
@ApiBearerAuth()
@Controller('courses')
export class QuizController {
  constructor(private readonly quizSerice: QuizService) {}

  @ApiOperation({ summary: 'Enroll Quiz' })
  @ApiParam({
    name: 'course_slug',
    required: true,
    type: 'string',
    description: 'Course Slug',
  })
  @ApiParam({
    name: 'quiz_uuid',
    required: true,
    type: 'string',
    description: 'Quiz UUID',
  })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':course_slug/quiz/:quiz_uuid/enroll')
  async enrollQuiz(
    @Param('course_slug') course_slug: string,
    @Param('quiz_uuid') quiz_uuid: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.quizSerice.takeQuiz({
      course_slug,
      quiz_uuid,
      user,
    });

    return {
      message: 'Berhasil mengambil quiz',
      data,
    };
  }

  @ApiOperation({ summary: 'Update Answer Question Quiz' })
  @ApiOkResponse()
  @HttpCode(200)
  @Patch('quiz/update-answer')
  async updateAnswerQuestion(
    @Body() payload: AnswerQuizDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.quizSerice.updateAnswer({
      payload,
      user,
    });

    return {
      message: 'Berhasil memperbarui jawaban',
      data,
    };
  }

  @ApiOperation({ summary: 'Submit Quiz' })
  @ApiOkResponse()
  @HttpCode(200)
  @Patch('quiz/:session_id/submit')
  async submitQuiz(
    @Param('session_id') session_id: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.quizSerice.submitQuiz({
      session_id,
      user,
    });

    return {
      message: 'Berhasil mengumpulkan quiz',
      data,
    };
  }
}