import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthenticationService } from './authentication.service';
import {
  ForgotPasswordRequestDto,
  ForgotPasswordResetDto,
  ForgotPasswordVerifyDto,
} from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { GoogleGuard } from './guards/google.guard';
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

  @AllowUnauthorizedRequest()
  @UseGuards(GoogleGuard)
  @ApiOperation({ summary: 'Google Callback' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get('login/google/callback')
  async loginWithGoogleCallback(@Req() req: Request) {
    const data = await this.authenticationService.loginWithGoogleID({
      google_id: req.user['google_id'],
    });

    return {
      message: 'Successfully logged in user',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiQuery({
    name: 'access_token',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'id_token',
    type: String,
    required: true,
  })
  @ApiOperation({ summary: 'Google Token Callback' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get('login/google/token')
  async loginWithGoogleToken(
    @Query('access_token') accessToken: string,
    @Query('id_token') idToken: string,
  ) {
    const data = await this.authenticationService.loginWithGoogleAccessToken({
      access_token: accessToken,
      id_token: idToken,
    });

    return {
      message: 'Successfully logged in user',
      data,
    };
  }

  @UseGuards(GoogleGuard)
  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Login with Google' })
  @ApiOkResponse()
  @HttpCode(200)
  @Get('login/google')
  async loginWithGoogle() {
    return 'OK';
  }

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Forgot Password Request' })
  @ApiOkResponse()
  @HttpCode(200)
  @Post('forgot-password/request')
  async forgotPasswordRequest(@Body() payload: ForgotPasswordRequestDto) {
    const data =
      await this.authenticationService.forgotPasswordRequest(payload);

    return {
      message: 'Successfully requested password reset',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Forgot Password Verify' })
  @ApiOkResponse()
  @HttpCode(200)
  @Post('forgot-password/verify')
  async forgotPasswordVerify(@Body() payload: ForgotPasswordVerifyDto) {
    const data = await this.authenticationService.forgotPasswordVerify(payload);

    return {
      message: 'Successfully verified OTP',
      data,
    };
  }

  @AllowUnauthorizedRequest()
  @ApiOperation({ summary: 'Forgot Password Reset' })
  @ApiOkResponse()
  @HttpCode(200)
  @Post('forgot-password/reset')
  async forgotPasswordReset(@Body() payload: ForgotPasswordResetDto) {
    const data = await this.authenticationService.forgotPasswordReset(payload);

    return {
      message: 'Successfully reset password, please login again',
      data,
    };
  }
}
