import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { instanceToPlain } from 'class-transformer';
import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import * as moment from 'moment';
import { PrismaService } from 'nestjs-prisma';
import { Socket } from 'socket.io';
import { MailService } from '../mail/mail.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { HashHelpers } from '../utils/hash.utils';
import { StringHelper } from '../utils/slug.utils';
import {
  ForgotPasswordRequestDto,
  ForgotPasswordResetDto,
  ForgotPasswordVerifyDto,
} from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable({ scope: Scope.REQUEST })
export class AuthenticationService {
  client: OAuth2Client;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async registerUser(payload: RegisterDto) {
    const newUser = await this.usersService.create({
      ...payload,
      role: 'user',
    });

    const token = await this.generateJwtToken(newUser);

    await this.updateRefreshToken({
      user: newUser,
      refreshToken: token.refresh_token,
      ipAddress: this.request.ip,
      userAgent: this.request.headers['user-agent'],
    });

    return {
      user: instanceToPlain(new UserEntity(newUser), { groups: ['detail'] }),
      token: token,
    };
  }

  async loginUser(payload: LoginDto) {
    const user = await this.usersService.findOneByEmail(payload.email, false);
    if (!user) throw new ForbiddenException('Invalid credentials');

    const isPasswordValid = await HashHelpers.comparePassword(
      payload.password,
      user.password,
    );
    if (!isPasswordValid) throw new ForbiddenException('Invalid credentials');

    const token = await this.generateJwtToken(user);

    await this.updateRefreshToken({
      user,
      refreshToken: token.refresh_token,
      ipAddress: this.request.ip,
      userAgent: this.request.headers['user-agent'],
    });

    return {
      user: instanceToPlain(new UserEntity(user), { groups: ['detail'] }),
      token,
    };
  }

  async refreshToken() {
    const refreshToken = this.request.user['refresh_token'];

    const oldToken = await this.prisma.sessionLogin.findUnique({
      where: { refresh_token: refreshToken },
    });
    if (!oldToken) throw new ForbiddenException('Access Denied');

    const user = await this.usersService.findOneByID(oldToken.user_id, false);
    if (!user) throw new ForbiddenException('Access Denied');

    const token = await this.generateJwtToken(user);

    await this.updateRefreshToken({
      user,
      oldRefreshToken: refreshToken,
      refreshToken: token.refresh_token,
      ipAddress: this.request.ip,
      userAgent: this.request.headers['user-agent'],
    });

    return {
      user: instanceToPlain(new UserEntity(user), { groups: ['detail'] }),
      token,
    };
  }

  async logOut(payload: LogoutDto) {
    const oldToken = await this.prisma.sessionLogin.findUnique({
      where: {
        refresh_token: payload.refresh_token,
      },
    });

    if (oldToken) {
      await this.prisma.sessionLogin.delete({
        where: { id: oldToken.id },
      });
    }

    return null;
  }

  async loginWithGoogleID({ google_id }: { google_id: string }) {
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { google_id },
      });

      const token = await this.generateJwtToken(user);

      await this.updateRefreshToken({
        user,
        refreshToken: token.refresh_token,
        ipAddress: this.request.ip,
        userAgent: this.request.headers['user-agent'],
      });

      return {
        user: instanceToPlain(new UserEntity(user), { groups: ['detail'] }),
        token,
      };
    });
  }

  async loginWithGoogleAccessToken({ access_token }: { access_token: string }) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: access_token,
      });
      const payload = ticket.getPayload();
      console.log(payload);

      await this.prisma.user.upsert({
        where: {
          email: payload.email,
        },
        create: {
          name: payload.name.trim(),
          email: payload.email,
          role: 'user',
          password: await HashHelpers.hashPassword(StringHelper.random(12)),
          google_id: payload.sub,
        },
        update: {
          name: payload.name.trim(),
          email: payload.email,
          google_id: payload.sub,
        },
      });

      const user = await this.loginWithGoogleID({ google_id: payload.sub });

      return user;
    } catch (error) {
      console.error('Google Login Error: ', error);
    }
  }

  async forgotPasswordRequest(payload: ForgotPasswordRequestDto) {
    return await this.prisma.$transaction(
      async (tx) => {
        const user = await this.usersService.findOneByEmail(payload.email);

        const minuteToExpire = 5;
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const otpHashed = await HashHelpers.hashPassword(OTP.toString());

        await tx.forgotPassword.upsert({
          where: {
            user_id: user.id,
          },
          create: {
            user_id: user.id,
            otp: otpHashed,
            expired_at: moment().add(minuteToExpire, 'minutes').toDate(),
          },
          update: {
            otp: otpHashed,
            expired_at: moment().add(minuteToExpire, 'minutes').toDate(),
            verified_at: null,
          },
        });

        await this.mailService.sendMail({
          data: {
            name: user.name,
            otp: OTP,
          },
          subject: 'PENS Online Classroom: Kode OTP Anda',
          template: 'sent-otp',
          to: user.email,
        });

        return null;
      },
      {
        timeout: 30000,
        maxWait: 30000,
      },
    );
  }

  async forgotPasswordVerify(payload: ForgotPasswordVerifyDto) {
    return await this.prisma.$transaction(
      async (tx) => {
        const token = await tx.forgotPassword.findFirst({
          where: {
            user: {
              email: payload.email,
            },
          },
        });

        if (
          !token ||
          !(await HashHelpers.comparePassword(payload.otp, token.otp))
        )
          throw new ForbiddenException('Invalid OTP');

        if (token.verified_at)
          throw new BadRequestException('OTP already verified');

        if (moment().isAfter(token.expired_at))
          throw new ForbiddenException('OTP expired');

        await tx.forgotPassword.update({
          where: {
            user_id: token.user_id,
          },
          data: {
            verified_at: new Date(),
          },
        });
      },
      {
        timeout: 30000,
        maxWait: 30000,
      },
    );
  }

  async forgotPasswordReset(payload: ForgotPasswordResetDto) {
    return await this.prisma.$transaction(
      async (tx) => {
        const token = await tx.forgotPassword.findFirst({
          where: {
            user: {
              email: payload.email,
            },
          },
        });

        if (
          !token ||
          !(await HashHelpers.comparePassword(payload.otp, token.otp))
        )
          throw new ForbiddenException('Invalid OTP');

        if (!token.verified_at)
          throw new BadRequestException('OTP not verified');

        if (moment().isAfter(token.expired_at))
          throw new ForbiddenException('OTP expired');

        if (payload.password !== payload.password_confirmation)
          throw new BadRequestException('Password confirmation does not match');

        const password = await HashHelpers.hashPassword(payload.password);

        await tx.user.update({
          where: {
            id: token.user_id,
          },
          data: {
            password,
          },
        });
      },
      {
        timeout: 30000,
        maxWait: 30000,
      },
    );
  }

  private async updateRefreshToken({
    user,
    oldRefreshToken,
    refreshToken,
    ipAddress,
    userAgent,
  }: {
    user: User;
    refreshToken: string;
    oldRefreshToken?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await this.prisma.sessionLogin.upsert({
      where: {
        refresh_token: oldRefreshToken ?? refreshToken,
      },
      create: {
        user_id: user.id,
        refresh_token: refreshToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        expired_at: moment()
          .add(
            this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
          )
          .toDate(),
      },
      update: {
        refresh_token: refreshToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        expired_at: moment()
          .add(
            this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
          )
          .toDate(),
      },
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

  async handleUserFromSocket(socket: Socket) {
    let token = socket.handshake.headers.authorization;
    if (!token) throw new ForbiddenException('Access Denied');

    token = token.split(' ')[1];

    let user = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });

    user = await this.usersService.findOneByID(user.sub);

    return user;
  }
}
