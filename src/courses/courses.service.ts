import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Course, Prisma } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginator } from '../utils/pagination.utils';
import { StringHelper } from '../utils/slug.utils';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    thumbnail: Express.Multer.File,
  ) {
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
        slug: StringHelper.slug(createCourseDto.name),
      },
    });

    return data;
  }

  async findAll({
    page = 1,
    name = undefined,
    where = undefined,
  }: {
    page: number;
    name?: string;
    where?: Prisma.CourseWhereInput;
  }) {
    const pagination = createPaginator({ perPage: 25 });

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
          AND: [{ is_active: true }, { ...where }],
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

  async update(
    slug: string,
    updateCourseDto: UpdateCourseDto,
    thumbnail: Express.Multer.File,
  ) {
    const course = await this.findOneBySlug(slug);

    if (thumbnail) {
      if (course.thumbnail) {
        // TODO: Delete old thumbnail
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

  async remove(slug: string) {
    const course = await this.findOneBySlug(slug);

    if (course.thumbnail) {
      // TODO: Delete old thumbnail
    }

    await this.prisma.course.delete({
      where: { id: course.id },
    });

    return null;
  }
}
