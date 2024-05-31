import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Question } from '@prisma/client';
import { CurriculumsService } from '../courses/curriculums/curriculums.service';
import { QuizSession } from '../entities/quiz.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ArrayHelpers } from '../utils/array.utils';
import { NotificationType, notificationWording } from '../utils/wording.utils';
import { CreateQuizDto, UpdateQuizDto } from './dto/payload-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly curriculumsService: CurriculumsService,
    private readonly notificationService: NotificationsService,
  ) {}

  async createQuiz({ payload }: { payload: CreateQuizDto }) {
    // TODO: Check User is Teacher & Course is handled by Teacher

    const checkCurriculum = await this.curriculumsService.findOneByUUID(
      payload.curriculum_uuid,
      payload.course_slug,
    );

    const data = await this.prismaService.$transaction(async (tx) => {
      if (payload.generated_questions.all_curriculum_questions) {
        const questions = await tx.question.findMany({
          where: {
            quiz: {
              curriculum: {
                course: {
                  slug: payload.course_slug,
                },
              },
            },
          },
        });

        return await tx.quiz.create({
          data: {
            title: payload.title,
            duration: payload.duration,
            curriculum_id: checkCurriculum.id,
            description: payload.description,
            start_date: payload.start_date,
            end_date: payload.end_date,
            is_active: false,
            is_ended: false,
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
            questions: {
              createMany: {
                data: questions.map((question) => {
                  delete question.id;
                  delete question.quiz_id;

                  return {
                    ...question,
                  };
                }),
              },
            },
          },
        });
      } else {
        return await tx.quiz.create({
          data: {
            title: payload.title,
            duration: payload.duration,
            curriculum_id: checkCurriculum.id,
            description: payload.description,
            start_date: payload.start_date,
            end_date: payload.end_date,
            is_active: false,
            is_ended: false,
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
    });

    return data;
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

    return await this.prismaService.$transaction(async (tx) => {
      const data = await tx.quiz.update({
        where: {
          id: quiz_uuid,
        },
        include: {
          option_generated: true,
          questions: true,
          curriculum: true,
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
                total_question: payload.generated_questions.total_questions,
              },
            },
          },
        },
      });

      if (data) {
        if (data.is_active) {
          const course = await tx.course.findFirst({
            where: {
              slug: payload.course_slug,
            },
            include: {
              enrollments: true,
            },
          });

          // Validation Quiz
          await this.validationQuiz({ data });

          const wording = notificationWording(NotificationType.course_new_quiz);

          await this.notificationService.sendNotification({
            user_ids: course.enrollments.map(
              (enrollment) => enrollment.user_id,
            ),
            title: wording.title,
            body: wording.body,
            type: wording.type,
            action_id: payload.course_slug,
          });
        }

        console.log(data.option_generated.all_curriculum);
        console.log(data.questions.length);

        if (
          data.option_generated.all_curriculum &&
          data.questions.length >= 0
        ) {
          const questions = await tx.question.findMany({
            where: {
              quiz: {
                curriculum: {
                  course: {
                    slug: payload.course_slug,
                  },
                },
                questions: {
                  none: {
                    quiz_id: quiz_uuid,
                  },
                },
              },
            },
          });

          const newQuestions = questions.filter((question) => {
            // If Title is same, then it's same question
            return !data.questions.some(
              (q) =>
                q.question.toLowerCase() == question.question.toLowerCase(),
            );
          });

          console.log(newQuestions);

          await tx.quiz.update({
            where: {
              id: quiz_uuid,
            },
            data: {
              questions: {
                createMany: {
                  data: newQuestions.map((question) => {
                    delete question.id;
                    delete question.quiz_id;

                    return {
                      ...question,
                    };
                  }),
                },
              },
            },
          });
        }

        delete data.questions;
      }

      return data;
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

  async getQuizEnrolled({ quiz_uuid }: { quiz_uuid: string }) {
    const quiz = await this.findOneByUUID({
      quiz_uuid,
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
    // user,
  }: {
    quiz_uuid: string;
    user_id: number;
    // user: User;
  }) {
    const quiz = await this.findOneByUUID({
      quiz_uuid,
      // where: {
      //   curriculum: {
      //     course: {
      //       user_id: user.id,
      //     },
      //   },
      // },
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

    if (quiz.questions.length < 1) {
      throw new BadRequestException(
        `Quiz tidak memiliki soal, dimohon untuk menambahkan soal terlebih dahulu`,
      );
    }

    const generatedQuestions = quiz.option_generated;
    const totalGeneratedQuestions = quiz.option_generated.total_question;

    const easyQuestions = quiz.questions.filter((question) =>
      quiz.option_generated.all_curriculum
        ? question.level == 'easy'
        : question.level == 'easy' &&
          question.curriculum_id == quiz.curriculum_id,
    );

    const mediumQuestions = quiz.questions.filter((question) =>
      quiz.option_generated.all_curriculum
        ? question.level == 'medium'
        : question.level == 'medium' &&
          question.curriculum_id == quiz.curriculum_id,
    );

    const hardQuestions = quiz.questions.filter((question) =>
      quiz.option_generated.all_curriculum
        ? question.level == 'hard'
        : question.level == 'hard' &&
          question.curriculum_id == quiz.curriculum_id,
    );

    const totalQuestionEasy = Math.round(
      totalGeneratedQuestions * (generatedQuestions.easy / 100),
    );

    const totalQuestionMedium = Math.round(
      totalGeneratedQuestions * (generatedQuestions.medium / 100),
    );

    const totalQuestionHard = Math.round(
      totalGeneratedQuestions * (generatedQuestions.hard / 100),
    );

    questions.push(
      ...this.randomizeQuestions(easyQuestions, totalQuestionEasy),
      ...this.randomizeQuestions(mediumQuestions, totalQuestionMedium),
      ...this.randomizeQuestions(hardQuestions, totalQuestionHard),
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

  private async validationQuiz({
    data,
  }: {
    data: Prisma.QuizGetPayload<{
      include: { questions: true; option_generated: true; curriculum: true };
    }>;
  }) {
    // Validation Quiz
    if (data.questions.length < 1) {
      throw new BadRequestException(
        `Quiz tidak memiliki soal, dimohon untuk menambahkan soal terlebih dahulu`,
      );
    }

    if (data.option_generated.total_question < 1) {
      throw new BadRequestException(
        `Minimal soal yang di generate adalah 1, dimohon untuk mengupdate jumlah soal yang di menjadi lebih dari 1`,
      );
    }

    if (data.questions.length < data.option_generated.total_question * 2) {
      throw new BadRequestException(
        `Total pertanyaan yang dihasilkan harus setidaknya ${data.option_generated.total_question * 2}, tetapi hanya ${data.questions.length} yang disediakan.`,
      );
    }

    if (
      data.option_generated.easy +
        data.option_generated.medium +
        data.option_generated.hard !=
      100
    ) {
      throw new BadRequestException(
        `Jumlah persentase soal harus 100%, dimohon untuk mengupdate persentase soal`,
      );
    }

    // Check Minimum Question Percentage
    const totalQuestions = data.questions.length;
    const generatedQuestions = data.option_generated;
    const totalGeneratedQuestions = data.option_generated.total_question;

    if (data.option_generated.all_curriculum) {
      const totalQuestionEasy = Math.round(
        totalGeneratedQuestions * (generatedQuestions.easy / 100),
      );
      const totalQuestionMedium = Math.round(
        totalGeneratedQuestions * (generatedQuestions.medium / 100),
      );
      const totalQuestionHard = Math.round(
        totalGeneratedQuestions * (generatedQuestions.hard / 100),
      );

      const easyQuestions = data.questions.filter(
        (question) => question.level == 'easy',
      );
      const mediumQuestions = data.questions.filter(
        (question) => question.level == 'medium',
      );
      const hardQuestions = data.questions.filter(
        (question) => question.level == 'hard',
      );

      if (easyQuestions.length < totalQuestionEasy) {
        throw new BadRequestException(
          `Jumlah soal easy tidak mencukupi, dimohon untuk menambahkan soal easy terlebih dahulu minimal ${totalQuestionEasy} soal`,
        );
      }
      if (mediumQuestions.length < totalQuestionMedium) {
        throw new BadRequestException(
          `Jumlah soal medium tidak mencukupi, dimohon untuk menambahkan soal medium terlebih dahulu minimal ${totalQuestionMedium} soal`,
        );
      }
      if (hardQuestions.length < totalQuestionHard) {
        throw new BadRequestException(
          `Jumlah soal hard tidak mencukupi, dimohon untuk menambahkan soal hard terlebih dahulu minimal ${totalQuestionHard} soal`,
        );
      }
    } else {
      const totalQuestionEasy = Math.round(
        totalGeneratedQuestions * (generatedQuestions.easy / 100),
      );
      const totalQuestionMedium = Math.round(
        totalGeneratedQuestions * (generatedQuestions.medium / 100),
      );
      const totalQuestionHard = Math.round(
        totalGeneratedQuestions * (generatedQuestions.hard / 100),
      );

      const easyQuestions = data.questions.filter(
        (question) =>
          question.level == 'easy' &&
          question.curriculum_id == data.curriculum_id,
      );
      const mediumQuestions = data.questions.filter(
        (question) =>
          question.level == 'medium' &&
          question.curriculum_id == data.curriculum_id,
      );
      const hardQuestions = data.questions.filter(
        (question) =>
          question.level == 'hard' &&
          question.curriculum_id == data.curriculum_id,
      );

      if (easyQuestions.length < totalQuestionEasy) {
        throw new BadRequestException(
          `Jumlah soal easy pada kurikulum ${data.curriculum.title} tidak mencukupi, dimohon untuk menambahkan soal easy pada kurikulum ${data.curriculum.title} terlebih dahulu minimal ${totalQuestionEasy} soal`,
        );
      }
      if (mediumQuestions.length < totalQuestionMedium) {
        throw new BadRequestException(
          `Jumlah soal medium pada kurikulum ${data.curriculum.title} tidak mencukupi, dimohon untuk menambahkan soal medium pada kurikulum ${data.curriculum.title} terlebih dahulu minimal ${totalQuestionMedium} soal`,
        );
      }
      if (hardQuestions.length < totalQuestionHard) {
        throw new BadRequestException(
          `Jumlah soal hard pada kurikulum ${data.curriculum.title} tidak mencukupi, dimohon untuk menambahkan soal hard pada kurikulum ${data.curriculum.title} terlebih dahulu minimal ${totalQuestionHard} soal`,
        );
      }
    }

    // Check Total Question
    if (totalGeneratedQuestions > totalQuestions) {
      throw new BadRequestException(
        `Jumlah soal yang digenerate melebihi jumlah soal yang ada, dimohon untuk mengupdate jumlah soal yang di generate menjadi lebih kecil dari ${totalQuestions}`,
      );
    }
  }
}
