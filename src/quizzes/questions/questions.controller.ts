import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Roles } from '../../utils/decorators/roles.decorator';
import {
  CreateQuizQuestionCSVDto,
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
} from '../dto/payload-question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('Quiz - Questions ( ADMIN / DOSEN )')
@ApiBearerAuth()
@Roles(['admin', 'dosen'])
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

  @ApiOperation({
    summary: 'Upload pertanyaan dengan file CSV',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File CSV',
    type: CreateQuizQuestionCSVDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @HttpCode(201)
  @ApiCreatedResponse()
  @Post(':quiz_uuid/questions/upload')
  async uploadQuestionByCSV(
    @UploadedFile() file: Express.Multer.File,
    @Query('quiz_uuid') quiz_uuid: string,
  ) {
    const data = await this.questionsService.createQuestionByCSV({
      csv: file,
      quiz_uuid,
    });

    return {
      message: 'Pertanyaan berhasil diupload',
      data,
    };
  }
}
