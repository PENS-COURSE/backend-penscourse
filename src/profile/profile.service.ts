import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { HashHelpers } from '../utils/hash.utils';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(REQUEST) private readonly req: Request,
  ) {}

  async profile() {
    const userId = this.req.user['id'];
    const user = await this.usersService.findOneByID(userId);

    return new UserEntity(user);
  }

  async updateProfile(payload: UpdateProfileDto, avatar?: Express.Multer.File) {
    const userId = this.req.user['id'];
    const user = await this.usersService.update(
      userId,
      {
        name: payload.name,
      },
      avatar,
    );

    return new UserEntity(user);
  }

  async changePassword(payload: ChangePasswordDto) {
    const userId = this.req.user['id'];
    const user = await this.usersService.findOneByID(userId);

    if (payload.password_new !== payload.password_new_confirm) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const isOldPasswordValid = await HashHelpers.comparePassword(
      payload.password_old,
      user.password,
    );

    if (!isOldPasswordValid)
      throw new BadRequestException('Invalid old password');

    await this.usersService.update(userId, {
      password: await HashHelpers.hashPassword(payload.password_new),
    });

    return null;
  }
}
