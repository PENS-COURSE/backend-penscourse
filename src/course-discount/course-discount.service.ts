import { BadRequestException, Injectable } from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDiscountDto } from './dto/create-course-discount.dto';

// TODO ADD SCHEDULER TO UPDATE DISCOUNTS
// TODO ADD PAGINATION

@Injectable()
export class CourseDiscountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CoursesService,
  ) {}

  async createCourseDiscount(payload: CreateCourseDiscountDto) {
    const course = await this.courseService.findOneBySlug(payload.course_slug);

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

  async findAll() {
    const discounts = await this.prisma.courseDiscount.findMany({});

    return discounts;
  }

  async findOne(courseSlug: string) {
    const course = await this.courseService.findOneBySlug(courseSlug);

    const discount = await this.prisma.courseDiscount.findUnique({
      where: {
        course_id: course.id,
      },
      include: {
        course: true,
      },
    });

    return discount;
  }

  async update(courseSlug: string, payload: CreateCourseDiscountDto) {
    const course = await this.courseService.findOneBySlug(courseSlug);

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
    const course = await this.courseService.findOneBySlug(courseSlug);

    const discount = await this.prisma.courseDiscount.delete({
      where: {
        course_id: course.id,
      },
    });

    return discount;
  }
}
