import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CommonService } from '../common/common.service';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginator } from '../utils/pagination.utils';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CoursesService,
    private readonly commonService: CommonService,
  ) {}

  async findAll({ user, page = 1 }: { user: User; page?: number }) {
    const pagination = createPaginator({ perPage: 25 });

    return pagination({
      model: this.prisma.enrollment,
      args: {
        where: {
          user_id: user.id,
        },
        include: {
          course: true,
        },
      },
      map: async (enrollments) =>
        await Promise.all(
          enrollments.map(async (enrollment) => {
            const progressCourse = await this.commonService.getProgressCourse({
              course_id: enrollment.course_id,
              user,
            });

            return {
              ...enrollment,
              course: {
                ...enrollment.course,
              },
              ...progressCourse,
            };
          }),
        ),
      options: {
        page: page,
      },
    });
  }

  async getProgressClass({ slug, user }: { slug: string; user: User }) {
    const course = await this.courseService.findOneBySlug({ slug });

    const progressCourse = await this.commonService.getProgressCourse({
      course_id: course.id,
      user,
    });

    return progressCourse;
  }
}
