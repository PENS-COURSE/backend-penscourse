import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { StorageHelpers } from '../utils/storage.utils';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreateBannerDto, file: Express.Multer.File) {
    delete payload.image;

    const banner = await this.prisma.banner.create({
      data: {
        ...payload,
        image_url: file.path,
      },
    });

    return banner;
  }

  async findAllForAdmin() {
    return await this.prisma.banner.findMany({
      orderBy: [
        {
          is_active: 'desc',
        },
        {
          order: 'asc',
        },
      ],
    });
  }

  async findAll() {
    return await this.prisma.banner.findMany({
      orderBy: {
        order: 'asc',
      },
      where: {
        is_active: true,
      },
    });
  }

  async findOne(id: number, throwException = true) {
    const banner = await this.prisma.banner.findUnique({
      where: {
        id,
      },
    });

    if (!banner && throwException)
      throw new NotFoundException('Banner tidak ditemukan');

    return banner;
  }

  async update(
    id: number,
    payload: UpdateBannerDto,
    file?: Express.Multer.File,
  ) {
    const banner = await this.findOne(id);

    delete payload.image;

    if (file) {
      StorageHelpers.deleteFile(banner.image_url);

      return await this.prisma.banner.update({
        where: {
          id,
        },
        data: {
          ...payload,
          image_url: file.path,
        },
      });
    }

    return await this.prisma.banner.update({
      where: {
        id,
      },
      data: {
        ...payload,
        image_url: banner.image_url,
      },
    });
  }

  async remove(id: number) {
    const banner = await this.findOne(id);

    StorageHelpers.deleteFile(banner.image_url);

    return await this.prisma.banner.delete({
      where: {
        id: banner.id,
      },
    });
  }
}
