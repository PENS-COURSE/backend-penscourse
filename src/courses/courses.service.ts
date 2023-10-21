import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Course, Prisma, User } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginator } from '../utils/pagination.utils';
import { StringHelper } from '../utils/slug.utils';
import { StorageHelpers } from '../utils/storage.utils';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

// TODO: Filter Course (Done, Active, Inactive, On Progress, Completed)

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
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

    const data = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        user_id: user?.role == 'admin' ? createCourseDto.user_id : user?.id,
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

    return await pagination<Course, Prisma.CourseFindManyArgs>({
      model: this.prisma.course,
      args: {
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
    });
  }

  async findOneByID(id: number, throwException = true) {
    const data = await this.prisma.course.findFirst({
      where: {
        id,
      },
      include: {
        curriculums: true,
      },
    });

    if (throwException && !data)
      throw new NotFoundException('Course not found');

    return data;
  }

  async findOneBySlug(slug: string, throwException = true) {
    const data = await this.prisma.course.findFirst({
      where: {
        slug,
      },
      include: {
        curriculums: true,
      },
    });

    if (throwException && !data)
      throw new NotFoundException('Course not found');

    return data;
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
    const course = await this.findOneBySlug(slug);

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

    const data = await this.prisma.course.update({
      where: { id: course.id },
      data: {
        ...updateCourseDto,
      },
    });

    return data;
  }

  async remove({ slug, user }: { slug: string; user?: User }) {
    const course = await this.findOneBySlug(slug);

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

    return null;
  }

  async enrollCourse({ slug, user }: { slug: string; user: User }) {
    const course = await this.findOneBySlug(slug);

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

    const data = await this.prisma.enrollment.create({
      data: {
        course_id: course.id,
        user_id: user.id,
      },
    });

    return data;
  }
}
