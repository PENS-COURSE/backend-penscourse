import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Question, User } from '@prisma/client';
import { CurriculumsService } from '../courses/curriculums/curriculums.service';
import { QuizSession } from '../entities/quiz.entity';
import { PrismaService } from '../prisma/prisma.service';
import { ArrayHelpers } from '../utils/array.utils';
import { CreateQuizDto, UpdateQuizDto } from './dto/payload-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly curriculumsService: CurriculumsService,
  ) {}

  async createQuiz({ payload }: { payload: CreateQuizDto }) {
    // TODO: Check User is Teacher & Course is handled by Teacher

    const checkCurriculum = await this.curriculumsService.findOneByUUID(
      payload.curriculum_uuid,
      payload.course_slug,
    );

    return await this.prismaService.quiz.create({
      data: {
        title: payload.title,
        duration: payload.duration,
        curriculum_id: checkCurriculum.id,
        description: payload.description,
        start_date: payload.start_date,
        end_date: payload.end_date,
        is_active: payload.is_active,
        is_ended: payload.is_ended,
        show_result: payload.show_result,
        pass_grade: payload.pass_grade,
        option_generated: {
          create: {
            easy: payload.generated_questions.easy_percentage,
            medium: payload.generated_questions.medium_percentage,
            hard: payload.generated_questions.hard_percentage,
            all_curriculum:
              payload.generated_questions.all_curriculum_questions,
            total_question: payload.generated_questions.total_questions,
          },
        },
      },
    });
  }

  async updateQuiz({
    payload,
    quiz_uuid,
  }: {
    payload: UpdateQuizDto;
    quiz_uuid: string;
  }) {
    // TODO: Check User is Teacher & Course is handled by Teacher

    const checkQuiz = await this.prismaService.quiz.findUnique({
      where: {
        id: quiz_uuid,
      },
    });
    if (!checkQuiz) {
      throw new NotFoundException('Quiz Tidak Ditemukan');
    }

    const checkCurriculum = await this.curriculumsService.findOneByUUID(
      payload.curriculum_uuid,
      payload.course_slug,
    );

    return await this.prismaService.quiz.update({
      where: {
        id: quiz_uuid,
      },
      data: {
        title: payload.title,
        duration: payload.duration,
        curriculum_id: checkCurriculum.id,
        description: payload.description,
        start_date: payload.start_date,
        end_date: payload.end_date,
        is_active: payload.is_active,
        is_ended: payload.is_ended,
        show_result: payload.show_result,
        pass_grade: payload.pass_grade,
        option_generated: {
          update: {
            where: {
              quiz_id: quiz_uuid,
            },
            data: {
              easy: payload.generated_questions.easy_percentage,
              medium: payload.generated_questions.medium_percentage,
              hard: payload.generated_questions.hard_percentage,
              all_curriculum:
                payload.generated_questions.all_curriculum_questions,
            },
          },
        },
      },
    });
  }

  async deleteQuiz({ quiz_uuid }: { quiz_uuid: string }) {
    // TODO: Check User is Teacher & Course is handled by Teacher

    const checkQuiz = await this.prismaService.quiz.findUnique({
      where: {
        id: quiz_uuid,
      },
    });
    if (!checkQuiz) {
      throw new NotFoundException('Quiz Tidak Ditemukan');
    }

    return await this.prismaService.quiz.delete({
      where: {
        id: quiz_uuid,
      },
    });
  }

  async findOneByUUID({
    quiz_uuid,
    include,
    where,
    throwException = true,
  }: {
    quiz_uuid: string;
    include?: Prisma.QuizInclude;
    where?: Prisma.QuizWhereInput;
    throwException?: boolean;
  }) {
    const quiz = await this.prismaService.quiz.findFirst({
      where: {
        id: quiz_uuid,
        ...where,
      },
      include: include,
    });
    if (!quiz && throwException) {
      throw new NotFoundException('Quiz Tidak Ditemukan');
    }

    return quiz;
  }

  async getQuizEnrolled({
    quiz_uuid,
    user,
  }: {
    quiz_uuid: string;
    user: User;
  }) {
    const quiz = await this.findOneByUUID({
      quiz_uuid,
      where: {
        curriculum: {
          course: {
            user_id: user.id,
          },
        },
      },
      include: {
        sessions: {
          include: {
            user: true,
          },
        },
      },
    });

    return quiz.sessions.map((session) => new QuizSession(session));
  }

  async resetQuizEnrolled({
    quiz_uuid,
    user_id,
    user,
  }: {
    quiz_uuid: string;
    user_id: number;
    user: User;
  }) {
    const quiz = await this.findOneByUUID({
      quiz_uuid,
      where: {
        curriculum: {
          course: {
            user_id: user.id,
          },
        },
      },
      include: {
        sessions: {
          include: {
            user: true,
          },
        },
      },
    });

    const userQuizSession = await this.prismaService.quizSession.findFirst({
      where: {
        quiz_id: quiz.id,
        user_id: user_id,
      },
    });

    if (!userQuizSession) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return await this.prismaService.quizSession.delete({
      where: {
        id: userQuizSession.id,
      },
    });
  }

  async generateQuiz({ quiz_uuid }: { quiz_uuid: string }) {
    const questions: Question[] = [];

    const quiz = await this.findOneByUUID({
      quiz_uuid,
      include: {
        option_generated: true,
        questions: {
          include: {
            answer: true,
          },
        },
      },
    });

    const totalQuestions = quiz.questions.length;

    const easyQuestions = quiz.questions.filter(
      (question) => question.level == 'easy',
    );
    const mediumQuestions = quiz.questions.filter(
      (question) => question.level == 'medium',
    );
    const hardQuestions = quiz.questions.filter(
      (question) => question.level == 'hard',
    );

    const totalEasy = Math.round(
      (quiz.option_generated.easy / 100) * totalQuestions,
    );
    const totalMedium = Math.round(
      (quiz.option_generated.medium / 100) * totalQuestions,
    );
    const totalHard = Math.round(
      (quiz.option_generated.hard / 100) * totalQuestions,
    );

    questions.push(
      ...this.randomizeQuestions(easyQuestions, totalEasy),
      ...this.randomizeQuestions(mediumQuestions, totalMedium),
      ...this.randomizeQuestions(hardQuestions, totalHard),
    );

    const randomQuestions: Question[] = ArrayHelpers.shuffle(questions);

    return randomQuestions;
  }

  private randomizeQuestions<T>(questions: T[], total: number): T[] {
    const questionsPick = [];

    for (let i = 0; i < total; i++) {
      const index = Math.floor(Math.random() * questions.length);

      if (!questionsPick.includes(questions[index])) {
        questionsPick.push(questions[index]);
      } else {
        i--;
      }
    }

    return questionsPick;
  }
}
