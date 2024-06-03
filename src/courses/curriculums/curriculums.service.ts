/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { StringHelper } from '../../utils/slug.utils';
import { CoursesService } from '../courses.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import {
  FileContentEntity,
  LiveClassEntity,
  VideoContentEntity,
} from './entity/SubjectEntity';

@Injectable()
export class CurriculumsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coursesService: CoursesService,
  ) {}

  async create(payload: CreateCurriculumDto, slugCourse: string) {
    const course = await this.coursesService.findOneBySlug({
      slug: slugCourse,
    });

    return await this.prisma.curriculum.create({
      data: {
        ...payload,
        course_id: course.id,
        slug: StringHelper.slug(payload.title),
      },
    });
  }

  async findAllWithSubjects({
    slugCourse,
    user = undefined,
  }: {
    slugCourse: string;
    user?: User;
  }) {
    const course = await this.coursesService.findOneBySlug({
      slug: slugCourse,
    });

    const userEnrolled = await this.prisma.enrollment.findFirst({
      where: {
        user_id: user?.id,
        course: {
          id: course.id,
        },
      },
    });

    const isUserEnrolled =
      userEnrolled ||
      user?.role === 'admin' ||
      (user?.role === 'dosen' && course.user_id === user?.id);

    const data = await this.prisma.curriculum.findMany({
      where: { course_id: course.id },
      include: {
        file_contents: true,
        live_classes: true,
        video_contents: true,
        quizzes: {
          where: {
            is_active: true,
          },
        },
      },
    });

    const resource = await Promise.all(
      data.map(async (curriculum) => {
        const {
          file_contents,
          live_classes,
          video_contents,
          quizzes,
          ...rest
        } = curriculum;
        return {
          ...rest,
          subjects: {
            quizzes: await Promise.all(
              curriculum.quizzes.map(async (quiz) => {
                const isTaken = await this.prisma.quizSession.findFirst({
                  where: {
                    quiz_id: quiz.id,
                    user_id: user?.id,
                  },
                });

                if (user?.role != 'dosen' && user?.role != 'admin') {
                  delete quiz.show_result;
                }

                if (!isUserEnrolled) {
                  return {
                    id: quiz.id,
                    title: quiz.title,
                    description: quiz.description,
                  };
                }

                return {
                  ...quiz,
                  is_taken: isTaken && isUserEnrolled ? true : false,
                  is_submitted: !!isTaken?.is_ended,
                };
              }),
            ),
            file_contents: await Promise.all(
              curriculum.file_contents.map(async (file) => {
                const isCompleted = user
                  ? await this.prisma.subjectCompletion.findFirst({
                      where: {
                        user_id: user?.id,
                        file_content_id: file.id,
                      },
                    })
                  : null;

                const entity = new FileContentEntity(file);
                const data = {
                  ...entity,
                  is_completed: isCompleted ? true : false,
                };

                if (user == null) delete data.is_completed;

                if (!isUserEnrolled) {
                  return {
                    id: file.id,
                    title: file.title,
                    description: file.description,
                  };
                }

                return data;
              }),
            ),
            live_classes: await Promise.all(
              curriculum.live_classes.map(async (liveClass) => {
                const isCompleted = user
                  ? await this.prisma.subjectCompletion.findFirst({
                      where: {
                        user_id: user?.id,
                        live_class_id: liveClass.id,
                      },
                    })
                  : null;

                const entity = new LiveClassEntity(liveClass, user);
                const data = {
                  ...entity,
                  is_completed: isCompleted ? true : false,
                };

                if (user == null) delete data.is_completed;

                if (!isUserEnrolled) {
                  return {
                    id: liveClass.id,
                    title: liveClass.title,
                    description: liveClass.description,
                  };
                }

                return data;
              }),
            ),
            video_contents: await Promise.all(
              curriculum.video_contents.map(async (video) => {
                const isCompleted = user
                  ? await this.prisma.subjectCompletion.findFirst({
                      where: {
                        user_id: user?.id,
                        video_content_id: video.id,
                      },
                    })
                  : null;

                const entity = new VideoContentEntity(video);
                const data = {
                  ...entity,
                  is_completed: isCompleted ? true : false,
                };

                if (user == null) delete data.is_completed;

                if (!isUserEnrolled) {
                  return {
                    id: video.id,
                    title: video.title,
                    description: video.description,
                  };
                }

                return data;
              }),
            ),
          },
        };
      }),
    );

    return resource;
  }

  async findOneByUUID(uuid: string, slugCourse: string, throwException = true) {
    const course = await this.coursesService.findOneBySlug({
      slug: slugCourse,
    });

    const data = await this.prisma.curriculum.findFirst({
      where: { id: uuid, course_id: course.id },
    });

    if (throwException && !data)
      throw new NotFoundException('Curriculum not found');

    return data;
  }

  async update(uuid: string, slugCourse: string, payload: UpdateCurriculumDto) {
    const curriculum = await this.findOneByUUID(uuid, slugCourse);
    return await this.prisma.curriculum.update({
      where: {
        id: curriculum.id,
      },
      data: {
        ...payload,
      },
    });
  }

  async remove(uuid: string, slugCourse: string) {
    const curriculum = await this.findOneByUUID(uuid, slugCourse);

    await this.prisma.curriculum.delete({
      where: {
        id: curriculum.id,
      },
    });

    return null;
  }
}
