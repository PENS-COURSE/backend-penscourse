import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as moment from 'moment';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async registerUser(payload: CreateUserDto) {
    const newUser = await this.usersService.create({
      ...payload,
      role: 'user',
    });

    const token = await this.generateJwtToken(newUser);

    await this.updateRefreshToken(newUser, token.refresh_token);

    return {
      user: new UserEntity(newUser),
      token: token,
    };
  }

  async loginUser(payload: LoginDto) {
    const user = await this.usersService.findOneByEmail(payload.email, false);
    if (!user) throw new ForbiddenException('Invalid credentials');

    const token = await this.generateJwtToken(user);

    await this.updateRefreshToken(user, token.refresh_token);

    return {
      user: new UserEntity(user),
      token: token,
    };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findOneByID(userId, false);
    const oldToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!user || !oldToken) throw new ForbiddenException('Access Denied');

    await this.prisma.refreshToken.delete({
      where: { id: oldToken.id },
    });

    const token = await this.generateJwtToken(user);

    await this.updateRefreshToken(user, token.refresh_token);

    return {
      user: new UserEntity(user),
      token: token,
    };
  }

  async logOut(payload: LogoutDto) {
    const { refresh_token: refreshToken } = payload;

    const oldToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (oldToken) {
      await this.prisma.refreshToken.delete({
        where: { id: oldToken.id },
      });
    }

    return null;
  }

  private async updateRefreshToken(user: User, refreshToken: string) {
    return await this.prisma.refreshToken.upsert({
      where: {
        token: refreshToken,
      },
      create: {
        user_id: user.id,
        token: refreshToken,
        expired_at: moment()
          .add(
            this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
          )
          .toDate(),
      },
      update: {},
    });
  }

  private async generateJwtToken(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
