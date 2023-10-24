import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as moment from 'moment';
import { UserEntity } from '../entities/user.entity';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { HashHelpers } from '../utils/hash.utils';
import {
  ForgotPasswordRequestDto,
  ForgotPasswordResetDto,
  ForgotPasswordVerifyDto,
} from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

// TODO: Login with Google

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
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

    const isPasswordValid = await HashHelpers.comparePassword(
      payload.password,
      user.password,
    );
    if (!isPasswordValid) throw new ForbiddenException('Invalid credentials');

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

  async loginWithGoogleID({ google_id }: { google_id: string }) {
    const user = await this.prisma.user.findUnique({
      where: { google_id },
    });

    if (!user) throw new ForbiddenException('Invalid credentials');

    const token = await this.generateJwtToken(user);

    await this.updateRefreshToken(user, token.refresh_token);

    return {
      user: new UserEntity(user),
      token: token,
    };
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

  async forgotPasswordRequest(payload: ForgotPasswordRequestDto) {
    await this.prisma.$transaction(async (tx) => {
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
          otp: OTP.toString(),
          expired_at: moment().add(minuteToExpire, 'minutes').toDate(),
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
    });
  }

  async forgotPasswordVerify(payload: ForgotPasswordVerifyDto) {
    await this.prisma.$transaction(async (tx) => {
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
    });
  }

  async forgotPasswordReset(payload: ForgotPasswordResetDto) {
    await this.prisma.$transaction(async (tx) => {
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

      if (!token.verified_at) throw new BadRequestException('OTP not verified');

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
    });
  }
}
