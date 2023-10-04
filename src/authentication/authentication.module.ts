import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { AccessTokenStrategy } from './strategy/access-token.strategy';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  providers: [AuthenticationService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
