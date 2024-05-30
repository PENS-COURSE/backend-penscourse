import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginator } from '../utils/pagination.utils';
import { StorageHelpers } from '../utils/storage.utils';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';

@Injectable()
export class LogoService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    payload,
    file,
  }: {
    payload: CreateLogoDto;
    file: Express.Multer.File;
  }) {
    delete payload.image;

    if (!file) throw new BadRequestException('Image is required');

    const ifFileExists = StorageHelpers.checkFileExists(
      `public/uploads/logos/${payload.title.toLowerCase()}.${file.path.split('.').pop()}`,
    );

    if (ifFileExists) {
      StorageHelpers.deleteFile(file.path);
      throw new ForbiddenException(
        'Logo with the same title already exists, please use another title',
      );
    }

    const path = await StorageHelpers.renameFile({
      oldPath: file.path,
      newPath: `public/uploads/logos/${payload.title.toLowerCase()}`,
      canChangeExtension: false,
    });

    const data = await this.prisma.logo.create({
      data: {
        ...payload,
        filename: path,
      },
    });

    return data;
  }

  async findAll({ page = 1, limit = 25 }: { page: number; limit?: number }) {
    const pagination = createPaginator({
      page,
      perPage: limit,
    });

    return await pagination({
      model: this.prisma.logo,
      args: {
        orderBy: [
          {
            created_at: 'desc',
          },
        ],
      },
      options: {
        page,
        perPage: limit,
      },
    });
  }

  async findOne({
    id,
    throwException = true,
  }: {
    id: number;
    throwException?: boolean;
  }) {
    const data = await this.prisma.logo.findUnique({
      where: {
        id,
      },
    });

    if (!data && throwException)
      throw new ForbiddenException('Logo tidak ditemukan');

    return data;
  }

  async update({
    id,
    payload,
    file,
  }: {
    id: number;
    payload: UpdateLogoDto;
    file: Express.Multer.File;
  }) {
    delete payload.image;

    const data = await this.findOne({ id });

    if (file?.path) {
      StorageHelpers.deleteFile(data.filename);
      const path = await StorageHelpers.renameFile({
        oldPath: file.path,
        newPath: `public/uploads/logos/${payload.title.toLowerCase()}`,
        canChangeExtension: false,
      });

      return await this.prisma.logo.update({
        where: {
          id,
        },
        data: {
          ...payload,
          filename: path,
        },
      });
    }

    return await this.prisma.logo.update({
      where: {
        id,
      },
      data: {
        ...payload,
      },
    });
  }

  async remove({ id }: { id: number }) {
    const data = await this.findOne({ id });

    StorageHelpers.deleteFile(data.filename);

    return await this.prisma.logo.delete({
      where: {
        id: data.id,
      },
    });
  }
}
