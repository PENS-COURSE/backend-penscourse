import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HasEnrolledGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user: User = request.user;

    if (['admin', 'dosen'].includes(user.role)) return false;

    const { slug, course_slug } = request.params;

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        user_id: user?.id,
        course: {
          slug: slug || course_slug,
        },
      },
    });

    if (!enrollment) return false;

    return true;
  }
}
