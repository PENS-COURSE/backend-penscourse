import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AllowUnauthorizedRequest } from './authentication/metadata/allow-unauthorized-request.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AllowUnauthorizedRequest()
  getHello() {
    return {
      message: 'Hello World !',
    };
  }
}
