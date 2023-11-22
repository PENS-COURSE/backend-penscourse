import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment';
import { QuestionEntity } from '../../entities/quiz.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { QuizzesService } from '../../quizzes/quizzes.service';
import { CoursesService } from '../courses.service';
import { AnswerQuizDto } from './dto/answer-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quizzesService: QuizzesService,
    private readonly coursesService: CoursesService,
  ) {}

  async takeQuiz({
    quiz_uuid,
    user,
    course_slug,
  }: {
    quiz_uuid: string;
    user: User;
    course_slug: string;
  }) {
    const course = await this.coursesService.findOneBySlug({
      slug: course_slug,
    });

    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: quiz_uuid,
        curriculum: {
          course_id: course.id,
        },
      },
    });

    if (!quiz) {
      throw new ForbiddenException('Quiz tidak ditemukan');
    }

    const checkSession = await this.prisma.quizSession.findFirst({
      where: {
        user_id: user.id,
        quiz_id: quiz.id,
      },
      include: {
        questions: {
          include: {
            question: {},
          },
        },
      },
    });

    if (!quiz.is_active) {
      throw new ForbiddenException('Quiz tidak aktif');
    }

    if (quiz.is_ended) {
      throw new ForbiddenException('Quiz sudah berakhir');
    }

    if (moment().isAfter(quiz.end_date)) {
      throw new ForbiddenException('Quiz sudah berakhir');
    } else if (moment().isBefore(quiz.start_date)) {
      throw new ForbiddenException('Quiz belum dimulai');
    }

    if (checkSession) {
      const duration = moment(checkSession.created_at)
        .add(quiz.duration, 'm')
        .toISOString();

      if (moment().isAfter(duration)) {
        throw new ForbiddenException('Waktu Quiz sudah habis');
      }

      const serializeQuestion = checkSession.questions.map((question) => {
        return {
          answer: question.answer,
          question: plainToInstance(QuestionEntity, question.question),
        };
      });

      return {
        quiz,
        questions: serializeQuestion,
        detail: {
          end_quiz: duration,
          session_id: checkSession.id,
        },
      };
    } else {
      const questions = await this.quizzesService.generateQuiz({
        quiz_uuid,
      });

      const session = await this.prisma.quizSession.create({
        include: {
          questions: {
            include: {
              question: {},
            },
          },
        },
        data: {
          user_id: user.id,
          quiz_id: quiz.id,
          questions: {
            createMany: {
              data: questions.map((question) => ({
                question_id: question.id,
              })),
            },
          },
        },
      });

      const serializeQuestion = session.questions.map((question) => {
        return {
          answer: question.answer,
          question: plainToInstance(QuestionEntity, question.question),
        };
      });

      const duration = moment(session.created_at)
        .add(quiz.duration, 'm')
        .toISOString();

      return {
        quiz,
        questions: serializeQuestion,
        detail: {
          end_quiz: duration,
          session_id: session.id,
        },
      };
    }
  }

  async updateAnswer({
    payload,
    user,
  }: {
    payload: AnswerQuizDto;
    user: User;
  }) {
    const session = await this.prisma.quizSession.findFirst({
      where: {
        id: payload.session_id,
        user_id: user.id,
      },
      include: {
        quiz: true,
      },
    });

    if (!session) {
      throw new ForbiddenException('Session tidak ditemukan');
    }

    if (session.is_ended) {
      throw new ForbiddenException('Quiz sudah berakhir');
    }

    const duration = moment(session.created_at)
      .add(session.quiz.duration, 'm')
      .toISOString();

    if (moment().isAfter(duration)) {
      throw new ForbiddenException('Waktu Quiz sudah habis');
    }

    const answeredQuestion = await this.prisma.quizEnrolledQuestion.findFirst({
      where: {
        quiz_session_id: session.id,
        question_id: payload.question_id,
      },
      include: {
        question: true,
      },
    });

    if (!answeredQuestion) {
      throw new NotFoundException('Pertanyaan tidak ditemukan');
    }

    // Check Only Right Answer Alphabet A - E or a - e
    const rightAnswer = payload.answer;
    const regex = new RegExp(/^[a-eA-E]+$/);
    const checkRightAnswer = rightAnswer.every((answer) =>
      regex.test(answer.toLocaleLowerCase()),
    );

    if (!checkRightAnswer) {
      throw new BadRequestException(
        'Jawaban hanya boleh berupa huruf A,B,C,D,E',
      );
    }

    if (answeredQuestion.question.question_type === 'single_choice') {
      if (payload.answer.length !== 1) {
        throw new BadRequestException(
          'Jumlah jawaban maximal 1 untuk tipe pertanyaan ini',
        );
      }
    }

    await this.prisma.quizEnrolledQuestion.update({
      where: {
        quiz_session_id_question_id: {
          question_id: payload.question_id,
          quiz_session_id: session.id,
        },
      },
      data: {
        answer: {
          set: payload.answer.map((answer) => answer.toLowerCase()),
        },
      },
    });

    return null;
  }

  async submitQuiz({ session_id, user }: { session_id: string; user: User }) {
    const session = await this.prisma.quizSession.findFirst({
      where: {
        id: session_id,
        user_id: user.id,
      },
      include: {
        quiz: true,
        questions: {
          include: {
            question: {
              include: {
                answer: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new ForbiddenException('Session tidak ditemukan');
    }

    if (session.is_ended) {
      throw new ForbiddenException('Quiz sudah berakhir');
    }

    const totalQuestion = session.questions.length;
    const weight = 100 / totalQuestion;

    let score = 0;

    await Promise.all(
      session.questions.map(async (question) => {
        const questionType = question.question.question_type;
        const questionRightAnswer = question.question.answer;
        const userAnswer = question.answer;

        if (questionType == 'single_choice') {
          userAnswer.forEach((answer) => {
            const checkRightAnswer = questionRightAnswer.find(
              (rightAnswer) => rightAnswer.question_id == question.question_id,
            );

            if (checkRightAnswer) {
              if (checkRightAnswer.answer.includes(answer.toLowerCase())) {
                score += weight;
              }
            }
          });
        } else if (questionType == 'multiple_choice') {
          const totalRight = questionRightAnswer.map(
            (rightAnswer) => rightAnswer.answer,
          );

          let totalRightAnswerUser = 0;

          userAnswer.forEach((answer) => {
            if (totalRight.includes(answer.toLowerCase())) {
              totalRightAnswerUser++;
            }
          });

          const tempScore = (totalRightAnswerUser / totalRight.length) * weight;
          score += tempScore;
        }
      }),
    );

    await this.prisma.quizSession.update({
      where: {
        id: session.id,
      },
      data: {
        is_ended: true,
        score,
      },
    });

    if (session.quiz.show_result) {
      return {
        score,
        is_passed: score >= session.quiz.pass_grade,
      };
    } else {
      return null;
    }
  }
}