import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class HasEnrolledGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user: User = request.user;

    const { slug, course_slug } = request.params;

    const course = await this.prisma.course.findFirst({
      where: { slug: slug || course_slug },
    });

    if (!course) throw new NotFoundException('Kelas tidak ditemukan');

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        user_id: user.id,
        course_id: course.id,
      },
    });

    if (!enrollment)
      throw new ForbiddenException('Anda belum terdaftar di kelas ini');

    return true;
  }
}
