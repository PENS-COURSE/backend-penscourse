import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { HashHelpers } from '../utils/hash.utils';
import { createPaginator } from '../utils/pagination.utils';
import { StorageHelpers } from '../utils/storage.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, avatar?: Express.Multer.File) {
    const checkEmail = await this.findOneByEmail(createUserDto.email, false);
    if (checkEmail) {
      throw new ConflictException('Email already exists');
    }

    if (createUserDto.password !== createUserDto.password_confirmation) {
      throw new BadRequestException('Password confirmation does not match');
    }

    createUserDto.password = await HashHelpers.hashPassword(
      createUserDto.password,
    );

    if (avatar) {
      createUserDto.avatar = avatar.path;
    }

    delete createUserDto.password_confirmation;

    const data = await this.prisma.user.create({
      data: createUserDto,
    });

    return data;
  }

  async findAll({ page = 1 }: { page: number }) {
    const pagination = createPaginator({ perPage: 25 });
    return await pagination({
      model: this.prisma.user,
      options: {
        page,
      },
      map: async (data) =>
        data.map((user) =>
          instanceToPlain(new UserEntity(user), { groups: ['detail'] }),
        ),
    });
  }

  async findOneByID(id: number, throwException = true) {
    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    if (throwException && !user)
      throw new NotFoundException('User tidak ditemukan');

    return user;
  }

  async findOneByEmail(email: string, throwException = true) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (throwException && !user)
      throw new NotFoundException('User tidak ditemukan');

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    avatar?: Express.Multer.File,
  ) {
    const user = await this.findOneByID(id);

    if (avatar) {
      if (user.avatar) {
        StorageHelpers.deleteFile(user.avatar);
      }

      updateUserDto.avatar = avatar.path;
    }

    delete updateUserDto.password_confirmation;

    const data = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateUserDto,
    });

    return instanceToPlain(new UserEntity(data), { groups: ['detail'] });
  }

  async remove(id: number) {
    const user = await this.findOneByID(id);
    if (user.avatar) {
      StorageHelpers.deleteFile(user.avatar);
    }

    return await this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  }
}
