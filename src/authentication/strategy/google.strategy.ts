import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';
import { HashHelpers } from '../../utils/hash.utils';
import { StringHelper } from '../../utils/slug.utils';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(_: string, __: string, profile: any, done: VerifyCallback) {
    const { sub, email, name, picture } = profile._json;

    const user = await this.prisma.user.upsert({
      where: {
        email,
      },
      create: {
        email,
        name,
        email_verified_at: new Date(),
        google_id: sub,
        role: 'user',
        password: await HashHelpers.hashPassword(StringHelper.random(12)),
        avatar: picture,
      },
      update: {
        email,
        name,
        avatar: picture,
        google_id: sub,
      },
    });

    done(null, user);
  }
}
