import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AllowUnauthorizedRequest } from './metadata/allow-unauthorized-request.decorator';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Register User' })
  @ApiCreatedResponse()
  @HttpCode(201)
  @Post('register')
  async registerUser(@Body() payload: CreateUserDto) {
    const data = await this.authenticationService.registerUser(payload);

    return {
      message: 'Successfully registered user',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Login User' })
  @ApiOkResponse()
  @HttpCode(200)
  @Post('login')
  async loginUser(@Body() payload: LoginDto) {
    const data = await this.authenticationService.loginUser(payload);

    return {
      message: 'Successfully logged in user',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Refresh Token User' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @Get('refresh-token')
  async refreshToken(@Req() req: Request) {
    const userId = req.user['id'];
    const refreshToken = req.user['refresh_token'];

    const data = await this.authenticationService.refreshToken(
      userId,
      refreshToken,
    );

    return {
      message: 'Successfully refreshed token',
      data,
    };
  }

  @ApiOperation({ summary: 'Logout User' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(200)
  @Post('logout')
  async logOut(@Body() payload: LogoutDto) {
    const data = await this.authenticationService.logOut(payload);

    return {
      message: 'Successfully logged out user',
      data,
    };
  }
}
