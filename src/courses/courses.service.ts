import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment';
import { PrismaService } from 'nestjs-prisma';
import { NotificationsService } from '../notifications/notifications.service';
import { UserEntity } from '../users/entities/user.entity';
import { createPaginator } from '../utils/pagination.utils';
import { StringHelper } from '../utils/slug.utils';
import { StorageHelpers } from '../utils/storage.utils';
import { NotificationType, notificationWording } from '../utils/wording.utils';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseEntity } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  async create({
    user,
    createCourseDto,
    thumbnail,
  }: {
    user?: User;
    createCourseDto: CreateCourseDto;
    thumbnail: Express.Multer.File;
  }) {
    createCourseDto.thumbnail = thumbnail?.path;

    if (!createCourseDto.is_free) {
      if (!createCourseDto.price) {
        throw new BadRequestException('Price is required');
      }
    } else {
      createCourseDto.price = null;
    }

    const adminId = createCourseDto?.user_id || user?.id;

    const data = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        user_id: user?.role == 'admin' ? adminId : user?.id,
        slug: StringHelper.slug(createCourseDto.name),
      },
    });

    return data;
  }

  async findAll({
    page = 1,
    name = undefined,
    user = undefined,
    onlyPublisher = false,
    where = undefined,
  }: {
    page: number;
    name?: string;
    user?: User;
    where?: Prisma.CourseWhereInput;
    onlyPublisher?: boolean;
  }) {
    const pagination = createPaginator({ perPage: 25 });

    const whereUser: Prisma.CourseWhereInput = {
      AND: [
        { is_active: user?.role != 'user' ? undefined : true },
        {
          user_id:
            user?.role == 'admin'
              ? undefined
              : onlyPublisher
                ? user?.id
                : undefined,
        },
      ],
    };

    return await pagination({
      model: this.prisma.course,
      args: {
        include: {
          discount: true,
          user: true,
          reviews: true,
          enrollments: {
            where: {
              user_id: user?.id,
            },
          },
          curriculums: true,
          department: true,
        },
        orderBy: [
          {
            created_at: 'desc',
          },
          {
            enrollments: {
              _count: 'asc',
            },
          },
        ],
        where: {
          slug: {
            contains: name,
            mode: 'insensitive',
          },
          name: {
            contains: name,
            mode: 'insensitive',
          },
          ...where,
          ...whereUser,
        },
      },
      options: { page },
      map: async (courses) => {
        const mappedCourses = courses.map(async (course) => {
          let isEnrolled = false;
          if (user?.role == 'user' && course.enrollments.length) {
            isEnrolled = true;
          } else if (user?.role == 'admin') {
            isEnrolled = true;
          } else if (user?.id == course.user_id) {
            isEnrolled = true;
          } else {
            isEnrolled = false;
          }
          const isReviewed = course.reviews.find(
            (review) => review.user_id == user?.id,
          );

          delete course.enrollments;

          course.user = plainToInstance(UserEntity, course.user, {});

          const totalRating = course?.reviews.reduce(
            (acc, review) => acc + review.rating,
            0,
          );
          const averageRating = totalRating / course?.reviews.length;
          const totalUserRating = course?.reviews.length;

          delete course?.reviews;

          const data = {
            ...course,
            is_enrolled: isEnrolled ? true : false,
            ratings: averageRating || 0,
            total_user_rating: totalUserRating,
            is_reviewed: isReviewed ? true : false,
          };

          if (user && user?.role == 'user') {
            return data;
          }

          delete data.is_reviewed;

          return new CourseEntity(data);
        });

        return await Promise.all(mappedCourses);

        // return await Promise.all(mappedCourses).then((data) =>
        //   user
        //     ? data.sort((a) => {
        //         return a.is_enrolled ? 1 : -1;
        //       })
        //     : data,
        // );
      },
    });
  }

  async findOneByID(id: number, throwException = true) {
    const data = await this.prisma.course.findFirst({
      where: {
        id,
      },
      include: {
        curriculums: true,
        discount: true,
        department: true,
      },
    });

    if (throwException && !data)
      throw new NotFoundException('Course not found');

    return data;
  }

  async findOneBySlug({
    slug,
    throwException = true,
    include,
    user,
  }: {
    slug: string;
    throwException?: boolean;
    include?: Prisma.CourseInclude;
    user?: User;
  }) {
    const data = await this.prisma.course.findFirst({
      where: {
        slug,
      },
      include: {
        curriculums: true,
        department: true,
        discount: true,
        user: true,
        enrollments: {
          where: { user_id: user?.id },
        },
        reviews: true,
        ...include,
      },
    });

    if (throwException && !data)
      throw new NotFoundException('Course not found');

    let isEnrolled = false;
    if (user?.role == 'user' && data.enrollments.length) {
      isEnrolled = true;
    } else if (user?.role == 'admin') {
      isEnrolled = true;
    } else if (user?.role == 'dosen' && user?.id == data.user_id) {
      isEnrolled = true;
    } else {
      isEnrolled = false;
    }

    const totalRating = data.reviews.reduce(
      (acc, review) => acc + review.rating,
      0,
    );
    const isReviewed = data.reviews.find(
      (review) => review.user_id == user?.id,
    );

    const averageRating = totalRating / data.reviews.length;
    const totalUserRating = data.reviews.length;

    delete data?.reviews;
    delete data?.enrollments;

    const response = {
      ...data,
      is_enrolled: isEnrolled,
      ratings: averageRating || 0,
      total_user_rating: totalUserRating,
      is_reviewed: isReviewed ? true : false,
      user: plainToInstance(UserEntity, data.user, {}),
    };

    if (user && user?.role == 'user') {
      return response;
    }

    delete response.is_reviewed;

    return response;
  }

  async update({
    slug,
    updateCourseDto,
    thumbnail,
    user,
  }: {
    slug: string;
    updateCourseDto: UpdateCourseDto;
    thumbnail: Express.Multer.File;
    user?: User;
  }) {
    const course = await this.findOneBySlug({
      slug,
      include: {
        discount: true,
      },
    });

    if (user?.role != 'admin' && course.user_id != user?.id) {
      throw new BadRequestException(
        'You are not allowed to update this course',
      );
    }

    if (thumbnail) {
      if (course.thumbnail) {
        StorageHelpers.deleteFile(course.thumbnail);
      }

      updateCourseDto.thumbnail = thumbnail?.path;
    }

    const data = await this.prisma.$transaction(async (tx) => {
      const adminId = updateCourseDto?.user_id || user?.id;

      const courseUpdate = await tx.course.update({
        where: { id: course.id },
        data: {
          ...updateCourseDto,
          user_id: user?.role == 'admin' ? adminId : user?.id,
        },
      });

      if (
        updateCourseDto.price != course.price ||
        course?.discount?.discount_price == course.price
      ) {
        const discount = await tx.courseDiscount.findFirst({
          where: {
            course_id: course.id,
          },
        });

        if (discount) {
          await tx.courseDiscount.delete({
            where: {
              course_id: course.id,
            },
          });
        }
      }

      return courseUpdate;
    });

    return data;
  }

  async remove({ slug, user }: { slug: string; user?: User }) {
    const course = await this.findOneBySlug({ slug });

    if (user?.role != 'admin' && course.user_id != user?.id) {
      throw new BadRequestException(
        'You are not allowed to remove this course',
      );
    }

    if (course.thumbnail) {
      StorageHelpers.deleteFile(course.thumbnail);
    }

    await this.prisma.course.delete({
      where: { id: course.id },
    });

    return course;
  }

  async enrollCourse({ slug, user }: { slug: string; user: User }) {
    const course = await this.checkIsEnrollment({
      courseSlug: slug,
      user: user,
    });

    if (!course.is_free)
      throw new ForbiddenException(
        'Course ini tidak gratis, silahkan melakukan pembelian !',
      );

    await this.prisma.enrollment.create({
      data: {
        course_id: course.id,
        user_id: user.id,
      },
    });

    const wording = notificationWording(
      NotificationType.course_enrollment_free_success,
    );

    await this.notificationService.sendNotification({
      user_ids: [user.id],
      title: wording.title,
      body: wording.body,
      type: wording.type,
      action_id: course.slug,
    });

    return null;
  }

  async getStreamingToday({ slug, user }: { slug: string; user: User }) {
    const course = await this.findOneBySlug({
      slug,
      user,
    });

    if (user && user?.role === 'user') {
      if (!course.is_enrolled)
        throw new ForbiddenException('Anda belum terdaftar pada kelas ini');
    }

    const liveClass = await this.prisma.liveClass.findFirst({
      where: {
        curriculum: {
          course_id: course.id,
        },
        is_open: true,
        updated_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    if (!liveClass) {
      return null;
    }

    return liveClass;
  }

  async endCourse({ course_slug, user }: { course_slug: string; user: User }) {
    const course = await this.findOneBySlug({
      slug: course_slug,
      include: {
        user: true,
      },
    });

    if (user?.role != 'admin' || course.user_id != user?.id) {
      throw new ForbiddenException('Kamu tidak memiliki akses');
    }

    await this.prisma.course.update({
      where: { id: course.id },
      data: {
        is_completed: true,
        completed_at: new Date(),
      },
    });

    return null;
  }

  async listQuiz({ course_slug }: { course_slug: string }) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug: course_slug,
      },
      include: {
        curriculums: {
          include: {
            quizzes: {
              select: {
                id: true,
                title: true,
              },
              where: {
                is_active: true,
              },
            },
          },
        },
      },
    });

    return course.curriculums.flatMap((curriculum) => curriculum.quizzes);
  }

  async listParticipant({ course_slug }: { course_slug: string }) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug: course_slug,
      },
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return course.enrollments.flatMap((enrollment) => enrollment.user);
  }

  async checkIsEnrollment({
    courseSlug,
    user,
  }: {
    courseSlug: string;
    user: User;
  }) {
    const course = await this.findOneBySlug({ slug: courseSlug });

    const isEnrolled = await this.prisma.enrollment.findFirst({
      where: {
        course_id: course.id,
        user_id: user.id,
      },
    });

    if (isEnrolled) {
      throw new BadRequestException('Anda sudah terdaftar pada kelas ini');
    }

    if (!course.is_active) {
      throw new ForbiddenException();
    }

    if (course.is_completed) {
      throw new BadRequestException('Kelas ini sudah selesai');
    }

    if (course.start_date) {
      // Jika start_date sudah lewat tidak bisa enroll
      if (moment(course.start_date).isBefore(new Date())) {
        throw new BadRequestException(
          'Kelas ini sudah dimulai, tidak bisa enroll',
        );
      }
    }

    return course;
  }
}
