import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Prisma, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment';
import { PrismaService } from 'nestjs-prisma';
import { QuestionEntity } from '../../entities/quiz.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { QuizzesService } from '../../quizzes/quizzes.service';
import { createPaginator } from '../../utils/pagination.utils';
import {
  NotificationType,
  notificationWording,
} from '../../utils/wording.utils';
import { CoursesService } from '../courses.service';
import { AnswerQuizDto, AnswersQuizDto } from './dto/answer-quiz.dto';
import { QuestionNotValid } from './interface/QuestionNotValid';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly quizzesService: QuizzesService,
    private readonly coursesService: CoursesService,
    private readonly notificationService: NotificationsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async findAllQuiz({
    user,
    status,
    page = 1,
    limit = 25,
  }: {
    user: User;
    status: 'ongoing' | 'late' | 'finished';
    page: number;
    limit: number;
  }) {
    const pagination = createPaginator({ perPage: limit });

    if (limit > 25) {
      limit = 25;
    }

    let filterStatus: Prisma.QuizWhereInput = {};
    const filterSession: Prisma.QuizSessionWhereInput = {};

    switch (status) {
      case 'ongoing':
        filterStatus = {
          is_active: true,
          is_ended: false,
          sessions: {
            some: {
              user_id: user.id,
              is_ended: false,
            },
          },
          OR: [
            {
              start_date: {
                lte: new Date().toISOString(),
              },
              end_date: {
                gte: new Date().toISOString(),
              },
            },
            {
              start_date: null,
              end_date: null,
            },
            {
              AND: [
                {
                  sessions: {
                    some: {
                      user_id: user.id,
                      is_ended: false,
                    },
                    none: {
                      user_id: user.id,
                    },
                  },
                },
              ],
            },
          ],
        };
        break;
      case 'late':
        filterStatus = {
          is_active: true,
          OR: [
            {
              is_ended: false,
              end_date: {
                lt: new Date(),
              },
            },
            {
              is_ended: true,
              end_date: null,
            },
          ],
          sessions: {
            none: {
              user_id: user.id,
            },
          },
        };
        break;
      case 'finished':
        filterStatus = {
          sessions: {
            some: {
              user_id: user.id,
              is_ended: true,
            },
          },
        };
        filterSession.user_id = {
          equals: user.id,
        };
      default:
        break;
    }

    return await pagination({
      model: this.prisma.quiz,
      args: {
        where: {
          ...filterStatus,
          curriculum: {
            course: {
              enrollments: {
                some: {
                  user_id: user.id,
                },
              },
            },
          },
        },
        include: {
          sessions: {
            where: {
              ...filterSession,
            },
          },
          curriculum: {
            include: {
              course: true,
            },
          },
        },
      },
      options: {
        page,
        perPage: limit,
      },
      map: async (quizzes) => {
        return Promise.all(
          quizzes.map(async (quiz) => {
            const isTaken = await this.prisma.quizSession.findFirst({
              where: {
                quiz_id: quiz.id,
                user_id: user?.id,
              },
            });

            delete quiz.sessions;

            return {
              ...quiz,
              detail_score: {
                score: isTaken?.score,
                is_passed: isTaken?.score >= quiz.pass_grade,
              },
              is_submitted: !!isTaken?.is_ended,
              is_taken: !!isTaken,
            };
          }),
        );
      },
    });
  }

  async findOneQuiz({ quiz_uuid }: { quiz_uuid: string }) {
    const query: Prisma.QuizWhereInput = {
      id: quiz_uuid,
    };

    const quiz = await this.prisma.quiz.findFirst({
      where: query,
      include: {
        option_generated: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz tidak ditemukan');
    }

    // const isTaken = await this.prisma.quizSession.findFirst({
    //   where: {
    //     quiz_id: quiz.id,
    //     user_id: user?.id,
    //   },
    // });

    // Get Total Question Generated
    const totalQuestion = quiz?.option_generated?.total_question;
    delete quiz?.option_generated;

    return {
      ...quiz,
      total_questions: totalQuestion,
      // is_taken: !!isTaken,
    };
  }

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
      if (checkSession.is_ended) {
        throw new BadRequestException('Quiz telah selesai, tidak bisa diulang');
      }

      const duration = moment(checkSession.created_at)
        .add(quiz.duration, 'minutes')
        .toISOString();

      if (moment().isAfter(duration)) {
        throw new ForbiddenException('Waktu Quiz sudah habis');
      }

      // Get Duration 5 minutes before end
      const reminderDuration = moment(duration)
        .subtract(5, 'minutes')
        .toISOString();

      const sendNotificationBeforeEnd = setTimeout(
        async () => {
          const wording = notificationWording(
            NotificationType.exam_time_almost_up,
          );

          await this.notificationService.sendNotification({
            user_ids: [user.id],
            title: wording.title,
            body: wording.body,
            type: wording.type,
          });
        },
        moment(reminderDuration).diff(moment(), 'milliseconds'),
      );

      const getReminder = this.schedulerRegistry
        .getTimeouts()
        .find(
          (timeout) => timeout === `quiz.session.${checkSession.id}.reminder`,
        );
      if (!getReminder) {
        // Add Dynamic Scheduler for Send Notification 5 minutes before end
        this.schedulerRegistry.addTimeout(
          `quiz.session.${checkSession.id}.reminder`,
          sendNotificationBeforeEnd,
        );
      }

      const timeOut = setTimeout(
        async () => {
          await this.submitQuiz({ session_id: checkSession.id, user });
        },
        moment(duration).diff(moment(), 'milliseconds'),
      );

      const getTimeout = this.schedulerRegistry
        .getTimeouts()
        .find((timeout) => timeout === `quiz.session.${checkSession.id}`);
      if (!getTimeout) {
        // Add Dynamic Scheduler for Submit Quiz Automatically after duration ended
        this.schedulerRegistry.addTimeout(
          `quiz.session.${checkSession.id}`,
          timeOut,
        );
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
        .add(quiz.duration, 'minutes')
        .toISOString();

      // Get Duration 5 minutes before end
      const reminderDuration = moment(duration)
        .subtract(5, 'minutes')
        .toISOString();

      const sendNotificationBeforeEnd = setTimeout(
        async () => {
          const wording = notificationWording(
            NotificationType.exam_time_almost_up,
          );

          await this.notificationService.sendNotification({
            user_ids: [user.id],
            title: wording.title,
            body: wording.body,
            type: wording.type,
          });
        },
        moment(reminderDuration).diff(moment(), 'milliseconds'),
      );

      const getReminder = this.schedulerRegistry
        .getTimeouts()
        .find((timeout) => timeout === `quiz.session.${session.id}.reminder`);
      if (!getReminder) {
        // Add Dynamic Scheduler for Send Notification 5 minutes before end
        this.schedulerRegistry.addTimeout(
          `quiz.session.${session.id}.reminder`,
          sendNotificationBeforeEnd,
        );
      }

      const timeOut = setTimeout(
        async () => {
          await this.submitQuiz({ session_id: session.id, user });
        },
        moment(duration).diff(moment(), 'milliseconds'),
      );

      const getTimeout = this.schedulerRegistry
        .getTimeouts()
        .find((timeout) => timeout === `quiz.session.${session.id}`);
      if (!getTimeout) {
        // Add Dynamic Scheduler for Submit Quiz Automatically after duration ended
        this.schedulerRegistry.addTimeout(
          `quiz.session.${session.id}`,
          timeOut,
        );
      }

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
    const checkRightAnswer = rightAnswer.every((answer) => {
      if (typeof answer !== 'string') {
        return false;
      }

      return regex.test(answer.toLowerCase());
    });

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

  async updateAnswers({
    payload,
    user,
  }: {
    payload: AnswersQuizDto;
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
      .add(session.quiz.duration, 'minutes')
      .toISOString();

    if (moment().isAfter(duration)) {
      throw new ForbiddenException('Waktu Quiz sudah habis');
    }

    const answeredQuestion = await this.prisma.quizEnrolledQuestion.findMany({
      where: {
        quiz_session_id: payload.session_id,
      },
      include: {
        question: true,
      },
    });

    const questionsNotValid: QuestionNotValid[] = [];

    await Promise.all(
      payload.answers.map(async (answer) => {
        if (
          !answeredQuestion.find(
            (question) => question.question.id === answer.question_id,
          )
        ) {
          questionsNotValid.push({
            id: answer.question_id,
            message: 'Pertanyaan tidak ditemukan',
          });

          return null;
        }

        const rightAnswer = answer.answer;
        const regex = new RegExp(/^[a-eA-E]+$/);
        const checkRightAnswer = rightAnswer.every((answer) => {
          if (typeof answer !== 'string') {
            return false;
          }

          return regex.test(answer.toLowerCase());
        });

        if (!checkRightAnswer) {
          questionsNotValid.push({
            id: answer.question_id,
            message: 'Jawaban hanya boleh berupa huruf A,B,C,D,E',
          });

          return null;
        }

        const question = answeredQuestion.find(
          (question) => question.question.id === answer.question_id,
        );

        if (!question) {
          questionsNotValid.push({
            id: answer.question_id,
            message: 'Pertanyaan tidak ditemukan',
          });

          return null;
        }

        if (question.question.question_type === 'single_choice') {
          if (answer.answer.length !== 1) {
            questionsNotValid.push({
              id: answer.question_id,
              message: 'Jumlah jawaban maximal 1 untuk tipe pertanyaan ini',
            });
          }
        }

        await this.prisma.quizEnrolledQuestion.update({
          where: {
            quiz_session_id_question_id: {
              question_id: answer.question_id,
              quiz_session_id: payload.session_id,
            },
          },
          data: {
            answer: {
              set: answer.answer.map((answer) => answer.toLowerCase()),
            },
          },
        });

        return null;
      }),
    );

    if (questionsNotValid.length > 0) {
      throw new BadRequestException(questionsNotValid);
    }

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
        const userAnswer = question.answer.map((answer) =>
          answer.toLowerCase(),
        );

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
          const totalRight = questionRightAnswer.map((rightAnswer) =>
            rightAnswer.answer.toLowerCase(),
          );

          if (totalRight.sort().toString() === userAnswer.sort().toString()) {
            score += weight;
          }
        }
      }),
    );

    const getReminder = this.schedulerRegistry
      .getTimeouts()
      .find((timeout) => timeout === `quiz.session.${session.id}.reminder`);

    if (getReminder)
      this.schedulerRegistry.deleteTimeout(
        `quiz.session.${session.id}.reminder`,
      );

    const timeout = this.schedulerRegistry
      .getTimeouts()
      .find((timeout) => timeout === `quiz.session.${session.id}`);
    if (timeout)
      this.schedulerRegistry.deleteTimeout(`quiz.session.${session.id}`);

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

  async getResultQuiz({ quiz_uuid, user }: { quiz_uuid: string; user: User }) {
    const quiz = await this.findOneQuiz({ quiz_uuid });

    const session = await this.prisma.quizSession.findFirst({
      where: {
        user_id: user.id,
        quiz_id: quiz.id,
      },
    });

    if (!session) {
      throw new ForbiddenException(
        'Session tidak ditemukan, silahkan kerjakan quiz terlebih dahulu',
      );
    }

    return {
      quiz: quiz,
      score: session.score,
      is_passed: session.score >= quiz.pass_grade,
    };
  }

  // @Cron(CronExpression.EVERY_5_MINUTES)
  // async handleTimeout() {
  //   const sessions = await this.prisma.quizSession.findMany({
  //     where: {
  //       is_ended: false,
  //     },
  //     include: {
  //       quiz: true,
  //       user: true,
  //     },
  //   });

  //   // Send Notification for User that Quiz is about to end
  //   await Promise.all(
  //     sessions.map(async (session) => {
  //       const getReminder = this.schedulerRegistry
  //         .getTimeouts()
  //         .find((timeout) => timeout === `quiz.session.${session.id}.reminder`);

  //       if (!getReminder) {
  //         const duration = moment(session.created_at)
  //           .add(session.quiz.duration, 'minutes')
  //           .toISOString();

  //         const reminderDuration = moment(duration)
  //           .subtract(5, 'minutes')
  //           .toISOString();

  //         if (moment().isAfter(reminderDuration)) {
  //           const wording = notificationWording(
  //             NotificationType.exam_time_almost_up,
  //           );

  //           await this.notificationService.sendNotification({
  //             user_ids: [session.user.id],
  //             title: wording.title,
  //             body: wording.body,
  //             type: wording.type,
  //           });
  //         } else {
  //           const sendNotificationBeforeEnd = setTimeout(
  //             async () => {
  //               const wording = notificationWording(
  //                 NotificationType.exam_time_almost_up,
  //               );

  //               await this.notificationService.sendNotification({
  //                 user_ids: [session.user.id],
  //                 title: wording.title,
  //                 body: wording.body,
  //                 type: wording.type,
  //               });
  //             },
  //             moment(reminderDuration).diff(moment(), 'milliseconds'),
  //           );

  //           // Add Dynamic Scheduler for Send Notification 5 minutes before end
  //           this.schedulerRegistry.addTimeout(
  //             `quiz.session.${session.id}.reminder`,
  //             sendNotificationBeforeEnd,
  //           );
  //         }
  //       }
  //     }),
  //   );

  //   // Check if session is already ended
  //   await Promise.all(
  //     sessions.map(async (session) => {
  //       const timeout = this.schedulerRegistry
  //         .getTimeouts()
  //         .find((timeout) => timeout === `quiz.session.${session.id}`);
  //       if (timeout)
  //         this.schedulerRegistry.deleteTimeout(`quiz.session.${session.id}`);
  //       else {
  //         const duration = moment(session.created_at)
  //           .add(session.quiz.duration, 'minutes')
  //           .toISOString();

  //         if (moment().isAfter(duration)) {
  //           await this.submitQuiz({
  //             session_id: session.id,
  //             user: session.user,
  //           });

  //           console.log(
  //             `Quiz ${session.quiz.title} for user ${session.user.id} has ended`,
  //           );
  //         } else {
  //           const timeOut = setTimeout(
  //             async () => {
  //               await this.submitQuiz({
  //                 session_id: session.id,
  //                 user: session.user,
  //               });

  //               console.log(
  //                 `Quiz ${session.quiz.title} for user ${session.user.id} has ended`,
  //               );
  //             },
  //             moment(duration).diff(moment(), 'milliseconds'),
  //           );

  //           // Add Dynamic Scheduler for Submit Quiz Automatically after duration ended
  //           this.schedulerRegistry.addTimeout(
  //             `quiz.session.${session.id}`,
  //             timeOut,
  //           );
  //         }
  //       }
  //     }),
  //   );
  // }
}
