import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Department, Prisma } from '@prisma/client';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginator } from '../utils/pagination.utils';
import { StringHelper } from '../utils/slug.utils';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coursesServices: CoursesService,
  ) {}

  async create({
    createDepartmentDto,
    file,
  }: {
    createDepartmentDto: CreateDepartmentDto;
    file: {
      icon: Express.Multer.File;
      participant_thumbnail: Express.Multer.File;
      benefits_thumbnail: Express.Multer.File;
      opportunities_thumbnail: Express.Multer.File;
    };
  }) {
    if (!file) throw new BadRequestException('Icon is required');

    createDepartmentDto.icon = file.icon?.path;
    createDepartmentDto.participant_thumbnail =
      file.participant_thumbnail?.path;
    createDepartmentDto.benefits_thumbnail = file.benefits_thumbnail?.path;
    createDepartmentDto.opportunities_thumbnail =
      file.opportunities_thumbnail?.path;

    return await this.prisma.department.create({
      data: {
        ...createDepartmentDto,
        slug: StringHelper.slug(createDepartmentDto.name),
      },
    });
  }

  async findAll({
    page = 1,
    name = undefined,
  }: {
    page: number;
    name?: string;
  }) {
    const pagination = createPaginator({ perPage: 25, page: page });

    return await pagination<Department, Prisma.DepartmentFindManyArgs>({
      model: this.prisma.department,
      args: {
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
          slug: {
            contains: name,
            mode: 'insensitive',
          },
          AND: [{ is_active: true }],
        },
      },
    });
  }

  async findOneByID(id: number, throwException = true) {
    const department = await this.prisma.department.findFirst({
      where: {
        id,
        is_active: true,
      },
    });

    if (throwException && !department)
      throw new NotFoundException('Department not found');

    return department;
  }

  async findOneBySlug(slug: string, throwException = true) {
    const department = await this.prisma.department.findFirst({
      where: {
        slug,
        is_active: true,
      },
    });

    if (throwException && !department)
      throw new NotFoundException('Department not found');

    return department;
  }

  async getCoursesByDepartmentSlug({
    slug,
    page = 1,
    name = undefined,
  }: {
    slug: string;
    page: number;
    name?: string;
  }) {
    const department = await this.findOneBySlug(slug);

    return await this.coursesServices.findAll({
      page,
      name,
      where: {
        department_id: department.id,
        is_active: true,
      },
    });
  }

  async update({
    slug,
    updateDepartmentDto,
    file,
  }: {
    slug: string;
    updateDepartmentDto: UpdateDepartmentDto;
    file: {
      icon: Express.Multer.File;
      participant_thumbnail: Express.Multer.File;
      benefits_thumbnail: Express.Multer.File;
      opportunities_thumbnail: Express.Multer.File;
    };
  }) {
    const department = await this.findOneBySlug(slug);

    if (file.icon) {
      if (department.icon) {
        // TODO: Delete old icon
      }

      updateDepartmentDto.icon = file.icon?.path;
    }

    if (file.participant_thumbnail) {
      if (department.participant_thumbnail) {
        // TODO: Delete old icon
      }

      updateDepartmentDto.participant_thumbnail =
        file.participant_thumbnail?.path;
    }

    if (file.benefits_thumbnail) {
      if (department.benefits_thumbnail) {
        // TODO: Delete old icon
      }

      updateDepartmentDto.benefits_thumbnail = file.benefits_thumbnail?.path;
    }

    if (file.opportunities_thumbnail) {
      if (department.opportunities_thumbnail) {
        // TODO: Delete old icon
      }

      updateDepartmentDto.opportunities_thumbnail =
        file.opportunities_thumbnail?.path;
    }

    return await this.prisma.department.update({
      where: {
        id: department.id,
      },
      data: {
        ...updateDepartmentDto,
      },
    });
  }

  async remove(slug: string) {
    const department = await this.findOneBySlug(slug);

    if (department.icon) {
      // TODO: Delete old icon
    }

    if (department.participant_thumbnail) {
      // TODO: Delete old icon
    }

    if (department.benefits_thumbnail) {
      // TODO: Delete old icon
    }

    if (department.opportunities_thumbnail) {
      // TODO: Delete old icon
    }

    await this.prisma.department.delete({
      where: {
        id: department.id,
      },
    });

    return null;
  }
}
