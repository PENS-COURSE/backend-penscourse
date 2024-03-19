import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from '../users/entities/user.entity';
import { createPaginator } from '../utils/pagination.utils';
import { StringHelper } from '../utils/slug.utils';
import { StorageHelpers } from '../utils/storage.utils';
import { NotificationType, notificationWording } from '../utils/wording.utils';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseEntity } from './entities/course.entity';

// TODO: Filter Course (Done, Active, Inactive, On Progress, Completed)

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
          enrollments: {
            where: {
              user_id: user?.id,
            },
          },
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
          const isEnrolled = user?.role == 'user' && course.enrollments.length;

          delete course.enrollments;

          course.user = plainToInstance(UserEntity, course.user, {});

          const data = {
            ...course,
            is_enrolled: isEnrolled ? true : false,
          };

          if (user && user?.role == 'user') {
            return data;
          }

          delete data.is_enrolled;

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
        discount: true,
        user: true,
        enrollments: {
          where: { user_id: user?.id },
        },
        ...include,
      },
    });

    if (throwException && !data)
      throw new NotFoundException('Course not found');

    const isEnrolled = user?.role == 'user' && data.enrollments.length;

    return {
      ...data,
      is_enrolled: isEnrolled ? true : false,
      user: plainToInstance(UserEntity, data.user, {}),
    };
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
    const course = await this.findOneBySlug({ slug });

    if (!course.is_active) {
      throw new ForbiddenException();
    }

    if (!course.is_free) {
      throw new BadRequestException('This course is not free');
    }

    const isEnrolled = await this.prisma.enrollment.findFirst({
      where: {
        course_id: course.id,
        user_id: user.id,
      },
    });

    if (isEnrolled) {
      throw new BadRequestException('You have already enrolled this course');
    }

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
}
