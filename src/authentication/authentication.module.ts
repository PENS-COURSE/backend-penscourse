import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { AccessTokenStrategy } from './strategy/access-token.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  providers: [
    AuthenticationService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
