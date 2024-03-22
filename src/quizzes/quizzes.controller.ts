import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../utils/decorators/auth.decorator';
import { CreateQuizDto, UpdateQuizDto } from './dto/payload-quiz.dto';
import { QuizzesService } from './quizzes.service';

@ApiBearerAuth()
@ApiTags('Quizzes ( ADMIN / DOSEN )')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Create Quiz' })
  @ApiCreatedResponse()
  @HttpCode(201)
  @Post('create')
  async createQuiz(@Body() payload: CreateQuizDto) {
    const data = await this.quizzesService.createQuiz({ payload });

    return {
      message: 'Quiz Berhasil Dibuat',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Update Quiz' })
  @ApiOkResponse()
  @HttpCode(200)
  @Patch(':quiz_uuid/update')
  async updateQuiz(
    @Body() payload: UpdateQuizDto,
    @Param('quiz_uuid') quiz_uuid: string,
  ) {
    const data = await this.quizzesService.updateQuiz({ payload, quiz_uuid });

    return {
      message: 'Quiz Berhasil Diperbarui',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Remove Quiz' })
  @ApiOkResponse()
  @HttpCode(200)
  @Delete(':quiz_uuid/remove')
  async removeQuiz(@Param('quiz_uuid') quiz_uuid: string) {
    const data = await this.quizzesService.deleteQuiz({ quiz_uuid });

    return {
      message: 'Quiz Berhasil Dihapus',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Get Quiz Enrolled by Student' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':quiz_uuid/enrolled')
  async getQuizEnrolled(@Param('quiz_uuid') quiz_uuid: string) {
    const data = await this.quizzesService.getQuizEnrolled({ quiz_uuid });

    return {
      message: 'Quiz berhasil diambil',
      data,
    };
  }

  @Auth('admin', 'dosen')
  @ApiOperation({ summary: 'Reset Quiz Enrolled by Student' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get(':quiz_uuid/reset/:user_id')
  async resetQuizEnrolled(
    @Param('quiz_uuid') quiz_uuid: string,
    @Param('user_id') user_id: number,
    // @CurrentUser() user: any,
  ) {
    const data = await this.quizzesService.resetQuizEnrolled({
      quiz_uuid,
      user_id,
      // user,
    });

    return {
      message: 'Quiz berhasil direset',
      data,
    };
  }
}
