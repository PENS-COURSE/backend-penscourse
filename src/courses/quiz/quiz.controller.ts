import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../../authentication/decorators/current-user.decorators';
import { Auth } from '../../utils/decorators/auth.decorator';
import { HasEnrolledGuard } from '../../utils/guards/has-enrolled.guard';
import { AnswerQuizDto } from './dto/answer-quiz.dto';
import { QuizService } from './quiz.service';

@ApiTags('Course - Quiz')
@ApiBearerAuth()
@Controller('courses')
export class QuizController {
  constructor(private readonly quizSerice: QuizService) {}

  @Auth('user')
  @ApiOperation({ summary: 'Get All Quiz' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ongoing', 'late', 'finished'],
  })
  @ApiOkResponse()
  @HttpCode(200)
  @Get('quiz')
  async findAllQuiz(
    @CurrentUser() user: User,
    @Query('status') status: 'ongoing' | 'late' | 'finished',
  ) {
    const data = await this.quizSerice.findAllQuiz({
      status,
      user,
    });

    return {
      message: 'Berhasil mendapatkan semua quiz',
      data,
    };
  }

  @ApiOperation({
    summary: 'Get Quiz By Quiz UUID',
  })
  @ApiOkResponse()
  @HttpCode(200)
  @Get('quiz/:quiz_uuid')
  async findOneQuiz(
    @Param('quiz_uuid') quiz_uuid: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.quizSerice.findOneQuiz({
      quiz_uuid,
      user,
    });

    return {
      message: 'Berhasil mendapatkan quiz',
      data,
    };
  }

  @Auth('user')
  @UseGuards(HasEnrolledGuard)
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

  @Auth('user')
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

  @Auth('user')
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
