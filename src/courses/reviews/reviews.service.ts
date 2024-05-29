import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { createPaginator } from '../../utils/pagination.utils';
import { CoursesService } from '../courses.service';
import { ReviewsDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly courseService: CoursesService,
    private readonly userService: UsersService,
  ) {}

  async getReviewsByCourseSlug({
    course_slug,
    page,
    limit = 25,
  }: {
    course_slug: string;
    page: number;
    limit: number;
  }) {
    const pagination = createPaginator({ perPage: limit });

    if (limit > 25) {
      limit = 25;
    }

    const { id: course_id } = await this.courseService.findOneBySlug({
      slug: course_slug,
    });

    return await pagination({
      model: this.prismaService.review,
      args: {
        where: {
          course_id,
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: [
          {
            created_at: 'desc',
          },
        ],
      },
      options: {
        page,
        perPage: limit,
      },
    });
  }

  async createReview({
    course_slug,
    user,
    payload,
  }: {
    course_slug: string;
    user: User;
    payload: ReviewsDto;
  }) {
    const { comment, rating } = payload;

    const isUserHasReviewedCourse = await this.isUserHasReviewedCourse({
      course_slug,
      user,
    });

    if (isUserHasReviewedCourse)
      throw new ForbiddenException(
        'Anda sudah memberikan review untuk course ini',
      );

    const { id: user_id } = await this.userService.findOneByID(user.id);
    const { id: course_id, is_completed } =
      await this.courseService.findOneBySlug({
        slug: course_slug,
      });

    if (!is_completed)
      throw new ForbiddenException(
        'Course belum selesai, tidak dapat memberikan review, mohon menunggu hingga course selesai',
      );

    return await this.prismaService.review.create({
      data: {
        user_id: user_id,
        course_id: course_id,
        rating: rating,
        review: comment,
      },
    });
  }

  async deleteReview({ reviewId }: { reviewId: number }) {
    const review = await this.getReviewById({ reviewId });

    return await this.prismaService.review.delete({
      where: {
        id: review.id,
      },
    });
  }

  async isUserHasReviewedCourse({
    course_slug,
    user,
  }: {
    course_slug: string;
    user: User;
  }) {
    const { id: user_id } = await this.userService.findOneByID(user.id);
    const { id: course_id } = await this.courseService.findOneBySlug({
      slug: course_slug,
    });

    const review = await this.prismaService.review.findFirst({
      where: {
        user_id: user_id,
        course_id: course_id,
      },
    });

    return !!review;
  }

  async getReviewById({
    reviewId,
    throwException = true,
  }: {
    reviewId: number;
    throwException?: boolean;
  }) {
    const data = await this.prismaService.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!data && throwException)
      throw new ForbiddenException('Review tidak ditemukan');

    return data;
  }
}
