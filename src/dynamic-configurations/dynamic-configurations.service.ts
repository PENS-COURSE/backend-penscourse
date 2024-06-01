import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { StringHelper } from '../utils/slug.utils';
import {
  CreateDynamicConfigurationDto,
  CreateDynamicConfigurationValuesDto,
  UpdateDynamicConfigurationDto,
  UpdateDynamicConfigurationValuesDto,
} from './dynamic-configuration.dto';

@Injectable()
export class DynamicConfigurationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.dynamicConfigurations.findMany();
  }

  async findOne<T>({ by, id }: { by: 'slug' | 'id'; id: T }) {
    const data = await await this.prisma.dynamicConfigurations.findFirst({
      where: {
        [by]: id,
      },
      include: {
        DynamicConfigurationValues: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Konfigurasi tidak ditemukan');
    }

    return data;
  }

  async create({ payload }: { payload: CreateDynamicConfigurationDto }) {
    return await this.prisma.dynamicConfigurations.create({
      data: {
        title: payload.title,
        slug: StringHelper.slug(payload.title),
        description: payload.description,
      },
    });
  }

  async update({
    slug,
    payload,
  }: {
    slug: string;
    payload: UpdateDynamicConfigurationDto;
  }) {
    const config = await this.findOne({ by: 'slug', id: slug });

    return await this.prisma.dynamicConfigurations.update({
      where: {
        id: config.id,
      },
      data: {
        title: payload.title,
        slug: StringHelper.slug(payload.title),
        description: payload.description,
      },
    });
  }

  async remove({ slug }: { slug: string }) {
    const config = await this.findOne({ by: 'slug', id: slug });

    if (!config.can_delete) {
      throw new ForbiddenException('Konfigurasi tidak bisa dihapus');
    }

    return await this.prisma.dynamicConfigurations.delete({
      where: {
        id: config.id,
      },
    });
  }

  async findValue({ slug, id }: { slug: string; id: number }) {
    const config = await this.findOne({ by: 'slug', id: slug });

    const data = await this.prisma.dynamicConfigurationValues.findFirst({
      where: {
        id,
        dynamic_configuration_id: config.id,
      },
    });

    if (!data) {
      throw new NotFoundException('Konfigurasi tidak ditemukan');
    }

    return data;
  }

  async addValues({
    slug,
    payload,
  }: {
    slug: string;
    payload: CreateDynamicConfigurationValuesDto;
  }) {
    const config = await this.findOne({ by: 'slug', id: slug });

    return await this.prisma.dynamicConfigurationValues.create({
      data: {
        key: payload.key,
        value: payload.value,
        type: payload.type,
        dynamic_configuration_id: config.id,
      },
    });
  }

  async updateValues({
    slug,
    id,
    payload,
  }: {
    slug: string;
    id: number;
    payload: UpdateDynamicConfigurationValuesDto;
  }) {
    const config = await this.findOne({ by: 'slug', id: slug });

    return await this.prisma.dynamicConfigurationValues.update({
      where: {
        id,
        dynamic_configuration_id: config.id,
      },
      data: {
        key: payload.key,
        value: payload.value,
        type: payload.type,
        dynamic_configuration_id: config.id,
      },
    });
  }

  async removeValues({ slug, id }: { slug: string; id: number }) {
    const config = await this.findOne({ by: 'slug', id: slug });

    if (!config.can_delete) {
      throw new ForbiddenException('Konfigurasi tidak bisa dihapus');
    }

    return await this.prisma.dynamicConfigurationValues.delete({
      where: {
        id,
        dynamic_configuration_id: config.id,
      },
    });
  }
}
