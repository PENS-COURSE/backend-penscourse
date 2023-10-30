import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ user }: { user: User }) {
    return await this.prisma.enrollment.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        course: true,
      },
    });
  }
}
