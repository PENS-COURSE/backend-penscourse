import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginator } from '../utils/pagination.utils';
import { CreateCourseDiscountDto } from './dto/create-course-discount.dto';

// TODO ADD SCHEDULER TO UPDATE DISCOUNTS

@Injectable()
export class CourseDiscountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CoursesService,
  ) {}

  async createCourseDiscount(payload: CreateCourseDiscountDto) {
    const course = await this.courseService.findOneBySlug({
      slug: payload.course_slug,
    });

    if (!course.is_free) {
      if (payload.discount_price >= course.price) {
        throw new BadRequestException(
          'Diskon tidak boleh lebih besar dari harga course',
        );
      }
    } else {
      throw new BadRequestException('Tidak bisa diskon untuk course gratis');
    }

    delete payload.course_slug;

    return await this.prisma.courseDiscount.create({
      data: {
        ...payload,
        course_id: course.id,
      },
    });
  }

  async findAll({ page = 1 }: { page?: number }) {
    const paginator = createPaginator({ perPage: 25 });
    const discounts = await paginator({
      model: this.prisma.courseDiscount,
      args: {
        orderBy: {
          created_at: 'desc',
        },
        include: {
          course: true,
        },
      },
      options: {
        page: page,
      },
      map: async (discounts) =>
        discounts.map((discount) => {
          const { course, ...rest } = discount;
          return {
            ...course,
            discount: {
              ...rest,
            },
          };
        }),
    });

    return discounts;
  }

  async findOne(courseSlug: string) {
    const course = await this.courseService.findOneBySlug({ slug: courseSlug });

    const discount = await this.prisma.courseDiscount.findUnique({
      where: {
        course_id: course.id,
      },
    });

    if (!discount) {
      throw new NotFoundException('Diskon tidak ditemukan');
    }

    return {
      ...course,
      discount: {
        ...discount,
      },
    };
  }

  async update(courseSlug: string, payload: CreateCourseDiscountDto) {
    const course = await this.findOne(courseSlug);

    if (!course.is_free) {
      if (payload.discount_price >= course.price) {
        throw new BadRequestException(
          'Diskon tidak boleh lebih besar dari harga course',
        );
      }
    } else {
      throw new BadRequestException('Tidak bisa diskon untuk course gratis');
    }

    delete payload.course_slug;

    const discount = await this.prisma.courseDiscount.update({
      where: {
        course_id: course.id,
      },
      data: payload,
    });

    return discount;
  }

  async remove(courseSlug: string) {
    const course = await this.findOne(courseSlug);

    const discount = await this.prisma.courseDiscount.delete({
      where: {
        course_id: course.id,
      },
    });

    return discount;
  }
}
