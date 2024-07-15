import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CheckClassAuthorGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user;
    const { slug, course_slug } = context.switchToHttp().getRequest().params;

    if (user?.role === 'admin') {
      return true;
    }

    if (slug || course_slug) {
      const isCourseAuthor = await this.prisma.course.findFirst({
        where: {
          slug: slug || course_slug,
          user_id: user.id,
        },
      });

      if (!isCourseAuthor)
        throw new ForbiddenException(
          `Anda tidak memiliki akses ke kelas ini, silahkan hubungi admin untuk informasi lebih lanjut`,
        );
    }

    return true;
  }
}
