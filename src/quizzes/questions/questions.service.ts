import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
} from '../dto/payload-question.dto';
import { QuizzesService } from '../quizzes.service';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly quizService: QuizzesService,
  ) {}

  async getQuestions({ quiz_uuid }: { quiz_uuid: string }) {
    return await this.prismaService.question.findMany({
      where: {
        quiz_id: quiz_uuid,
      },
      include: {
        answer: true,
      },
    });
  }

  async getQuestion({
    question_uuid,
    quiz_uuid,
    throwException = true,
  }: {
    question_uuid: string;
    quiz_uuid: string;
    throwException?: boolean;
  }) {
    const checkQuiz = await this.quizService.findOneByUUID({
      quiz_uuid,
    });

    const data = await this.prismaService.question.findFirst({
      where: {
        id: question_uuid,
        quiz_id: checkQuiz.id,
      },
      include: {
        answer: true,
      },
    });

    if (!data && throwException) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    return data;
  }

  async createQuestion({
    quiz_uuid,
    payload,
  }: {
    quiz_uuid: string;
    payload: CreateQuizQuestionDto;
  }) {
    const checkQuiz = await this.quizService.findOneByUUID({
      quiz_uuid,
    });

    if (payload.right_answer.length === 0) {
      throw new BadRequestException('Jawaban tidak boleh kosong');
    }

    switch (payload.question_type) {
      case 'multiple_choice':
        if (payload.right_answer.length < 1) {
          throw new BadRequestException(
            'Jumlah jawaban minimal 2 untuk tipe pertanyaan ini',
          );
        }
        break;
      case 'single_choice':
        if (payload.right_answer.length !== 1) {
          throw new BadRequestException(
            'Jumlah jawaban maximal 1 untuk tipe pertanyaan ini',
          );
        }
        break;
    }

    // Check Only Right Answer Alphabet A - E or a - e
    const rightAnswer = payload.right_answer;
    const regex = new RegExp(/^[a-eA-E]+$/);
    const checkRightAnswer = rightAnswer.every((answer) =>
      regex.test(answer.toLocaleLowerCase()),
    );

    if (!checkRightAnswer) {
      throw new BadRequestException(
        'Jawaban hanya boleh berupa huruf A,B,C,D,E',
      );
    }

    return await this.prismaService.$transaction(async (tx) => {
      return await tx.question.create({
        data: {
          question: payload.question,
          question_type: payload.question_type,
          option_a: payload.option_a,
          option_b: payload.option_b,
          option_c: payload.option_c,
          option_d: payload.option_d,
          option_e: payload.option_e,
          quiz_id: checkQuiz.id,
          level: payload.level,
          curriculum_id: payload.curriculum_uuid,
          answer: {
            create: payload.right_answer.map((answer) => ({
              answer: answer.toLocaleLowerCase(),
            })),
          },
        },
      });
    });
  }

  async updateQuestion({
    question_uuid,
    quiz_uuid,
    payload,
  }: {
    question_uuid: string;
    quiz_uuid: string;
    payload: UpdateQuizQuestionDto;
  }) {
    const checkQuestion = await this.findOne({
      question_uuid,
    });

    const checkQuiz = await this.quizService.findOneByUUID({
      quiz_uuid,
    });

    if (payload.right_answer.length === 0) {
      throw new BadRequestException('Jawaban tidak boleh kosong');
    }

    switch (payload.question_type) {
      case 'multiple_choice':
        if (payload.right_answer.length < 1) {
          throw new BadRequestException(
            'Jumlah jawaban minimal 2 untuk tipe pertanyaan ini',
          );
        }
        break;
      case 'single_choice':
        if (payload.right_answer.length !== 1) {
          throw new BadRequestException(
            'Jumlah jawaban maximal 1 untuk tipe pertanyaan ini',
          );
        }
        break;
    }

    // Check Only Right Answer Alphabet A - E or a - e
    const rightAnswer = payload.right_answer;
    const regex = new RegExp(/^[a-eA-E]+$/);
    const checkRightAnswer = rightAnswer.every((answer) =>
      regex.test(answer.toLocaleLowerCase()),
    );

    if (!checkRightAnswer) {
      throw new BadRequestException(
        'Jawaban hanya boleh berupa huruf A,B,C,D,E',
      );
    }

    return await this.prismaService.question.update({
      where: {
        id: checkQuestion.id,
      },
      data: {
        question: payload.question,
        question_type: payload.question_type,
        option_a: payload.option_a,
        option_b: payload.option_b,
        option_c: payload.option_c,
        option_d: payload.option_d,
        option_e: payload.option_e,
        quiz_id: checkQuiz.id,
        level: payload.level,
        curriculum_id: payload.curriculum_uuid,
      },
    });
  }

  async removeQuestion({
    question_uuid,
    quiz_uuid,
  }: {
    question_uuid: string;
    quiz_uuid: string;
  }) {
    const checkQuestion = await this.findOne({
      question_uuid,
    });

    const checkQuiz = await this.quizService.findOneByUUID({
      quiz_uuid,
    });

    return await this.prismaService.question.delete({
      where: {
        id: checkQuestion.id,
        quiz_id: checkQuiz.id,
      },
    });
  }

  async findOne({
    question_uuid,
    throwException = true,
  }: {
    question_uuid: string;
    throwException?: boolean;
  }) {
    const question = await this.prismaService.question.findUnique({
      where: {
        id: question_uuid,
      },
    });

    if (!question && throwException) {
      throw new NotFoundException('Question Tidak Ditemukan');
    }

    return question;
  }
}