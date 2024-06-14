import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'nestjs-prisma';
import { CommonService } from '../common/common.service';
import { CoursesService } from '../courses/courses.service';
import { UserEntity } from '../users/entities/user.entity';
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

    if (user.role === 'user') {
      return await pagination({
        model: this.prisma.enrollment,
        args: {
          where: {
            user_id: user.id,
          },
          include: {
            course: {
              include: {
                user: true,
                reviews: true,
                department: {
                  select: {
                    name: true,
                    icon: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        map: async (enrollments) =>
          await Promise.all(
            enrollments.map(async (enrollment) => {
              const progressCourse = await this.commonService.getProgressCourse(
                {
                  course_id: enrollment.course_id,
                  user,
                },
              );

              const totalRating = enrollment.course?.reviews.reduce(
                (acc, review) => acc + review.rating,
                0,
              );
              const isReviewed = enrollment.course?.reviews.find(
                (review) => review.user_id == user?.id,
              );

              const averageRating =
                totalRating / enrollment.course?.reviews.length;
              const totalUserRating = enrollment.course?.reviews.length;

              delete enrollment.course?.reviews;

              return {
                ...enrollment,
                course: {
                  ...enrollment.course,
                  is_enrolled: true,
                  ratings: averageRating || 0,
                  total_user_rating: totalUserRating,
                  is_reviewed: isReviewed ? true : false,
                  user: plainToInstance(UserEntity, enrollment.course.user, {}),
                },
                ...progressCourse,
              };
            }),
          ),
        options: {
          page: page,
        },
      });
    } else if (user.role === 'admin' || user.role === 'dosen') {
      return await pagination({
        model: this.prisma.course,
        args: {
          where: {
            user_id: user.role === 'admin' ? undefined : user.id,
          },
          include: {
            user: true,
            reviews: true,
            department: {
              select: {
                name: true,
                icon: true,
                slug: true,
              },
            },
          },
          orderBy: [
            {
              created_at: 'desc',
            },
          ],
        },
        map: async (courses) => {
          return await Promise.all(
            courses.map(async (course) => {
              const totalRating = course?.reviews.reduce(
                (acc, review) => acc + review.rating,
                0,
              );
              const isReviewed = course?.reviews.find(
                (review) => review.user_id == user?.id,
              );

              const averageRating = totalRating / course?.reviews.length;
              const totalUserRating = course?.reviews.length;

              delete course?.reviews;

              return {
                user_id: user.id,
                course_id: course.id,
                course: {
                  ...course,
                  is_enrolled: true,
                  ratings: averageRating || 0,
                  total_user_rating: totalUserRating,
                  is_reviewed: isReviewed ? true : false,
                  user: plainToInstance(UserEntity, course.user, {}),
                },
              };
            }),
          );
        },
      });
    }
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
