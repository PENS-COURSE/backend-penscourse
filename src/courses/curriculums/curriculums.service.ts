import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StringHelper } from '../../utils/slug.utils';
import { CoursesService } from '../courses.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';

@Injectable()
export class CurriculumsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coursesService: CoursesService,
  ) {}

  async create(payload: CreateCurriculumDto, slugCourse: string) {
    const course = await this.coursesService.findOneBySlug(slugCourse);

    return await this.prisma.curriculum.create({
      data: {
        ...payload,
        course_id: course.id,
        slug: StringHelper.slug(payload.title),
      },
    });
  }

  async findAllWithSubjects({ slugCourse }: { slugCourse: string }) {
    const course = await this.coursesService.findOneBySlug(slugCourse);

    const data = await this.prisma.curriculum.findMany({
      where: { course_id: course.id },
      include: {
        file_contents: true,
        live_classes: true,
        video_contents: true,
      },
    });

    return data.map((curriculum) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { file_contents, live_classes, video_contents, ...rest } =
        curriculum;
      return {
        ...rest,
        subjects: {
          file_contents: curriculum.file_contents,
          live_classes: curriculum.live_classes,
          video_contents: curriculum.video_contents,
        },
      };
    });
  }

  async findOneByUUID(uuid: string, slugCourse: string, throwException = true) {
    const course = await this.coursesService.findOneBySlug(slugCourse);

    const data = await this.prisma.curriculum.findFirst({
      where: { id: uuid, course_id: course.id },
    });

    if (throwException && !data)
      throw new NotFoundException('Curriculum not found');

    return data;
  }

  async update(uuid: string, slugCourse: string, payload: UpdateCurriculumDto) {
    const curriculum = await this.findOneByUUID(uuid, slugCourse);
    return await this.prisma.curriculum.update({
      where: {
        id: curriculum.id,
      },
      data: {
        ...payload,
      },
    });
  }

  async remove(uuid: string, slugCourse: string) {
    const curriculum = await this.findOneByUUID(uuid, slugCourse);

    await this.prisma.curriculum.delete({
      where: {
        id: curriculum.id,
      },
    });

    return null;
  }
}
