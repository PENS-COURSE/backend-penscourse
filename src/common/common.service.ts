import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgressCourse({
    course_id,
    user,
  }: {
    course_id: number;
    user: User;
  }) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: course_id,
      },
    });

    const totalSubjects = await this.prisma.curriculum
      .findMany({
        where: {
          course_id: course_id,
        },
        include: {
          _count: {
            select: {
              file_contents: true,
              live_classes: true,
              video_contents: true,
            },
          },
        },
      })
      .then((total) => {
        let totalSubjects = 0;

        total.forEach((subject) => {
          totalSubjects += subject._count.file_contents;
          totalSubjects += subject._count.live_classes;
          totalSubjects += subject._count.video_contents;
        });

        return totalSubjects;
      });

    const markedAsCompleted = await this.prisma.subjectCompletion.count({
      where: {
        course_id: course.id,
        user_id: user.id,
      },
    });

    const progress = Math.round((markedAsCompleted / totalSubjects) * 100);

    return {
      total_subjects_count: totalSubjects,
      marked_as_completed_count: markedAsCompleted,
      progress_completed: progress,
    };
  }
}
