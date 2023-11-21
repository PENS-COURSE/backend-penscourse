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
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
} from '../dto/payload-question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('Quiz - Questions ( ADMIN / DOSEN )')
@ApiBearerAuth()
@Controller('quizzes')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @HttpCode(200)
  @ApiOkResponse()
  @Get(':quiz_uuid/questions')
  async getQuestions(@Param('quiz_uuid') quiz_uuid: string) {
    const data = await this.questionsService.getQuestions({
      quiz_uuid,
    });

    return {
      message: 'Pertanyaan berhasil didapatkan',
      data,
    };
  }

  @HttpCode(200)
  @ApiOkResponse()
  @Get(':quiz_uuid/questions/:question_uuid')
  async getQuestion(
    @Param('quiz_uuid') quiz_uuid: string,
    @Param('question_uuid') question_uuid: string,
  ) {
    const data = await this.questionsService.getQuestion({
      quiz_uuid,
      question_uuid,
    });

    return {
      message: 'Pertanyaan berhasil didapatkan',
      data,
    };
  }

  @HttpCode(201)
  @ApiCreatedResponse()
  @Post(':quiz_uuid/questions/create')
  async createQuestion(
    @Body() payload: CreateQuizQuestionDto,
    @Param('quiz_uuid') quiz_uuid: string,
  ) {
    const data = await this.questionsService.createQuestion({
      payload,
      quiz_uuid,
    });

    return {
      message: 'Pertanyaan berhasil dibuat',
      data,
    };
  }

  @HttpCode(200)
  @ApiOkResponse()
  @Patch(':quiz_uuid/questions/:question_uuid/update')
  async updateQuestion(
    @Body() payload: UpdateQuizQuestionDto,
    @Param('quiz_uuid') quiz_uuid: string,
    @Param('question_uuid') question_uuid: string,
  ) {
    const data = await this.questionsService.updateQuestion({
      payload,
      quiz_uuid,
      question_uuid,
    });

    return {
      message: 'Pertanyaan berhasil diperbarui',
      data,
    };
  }

  @HttpCode(200)
  @ApiOkResponse()
  @Delete(':quiz_uuid/questions/:question_uuid/delete')
  async removeQuestion(
    @Param('quiz_uuid') quiz_uuid: string,
    @Param('question_uuid') question_uuid: string,
  ) {
    const data = await this.questionsService.removeQuestion({
      quiz_uuid,
      question_uuid,
    });

    return {
      message: 'Pertanyaan berhasil dihapus',
      data,
    };
  }
}
