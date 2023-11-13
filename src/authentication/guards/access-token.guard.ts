import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AllowUnauthorizedRequestKey } from '../metadata/allow-unauthorized-request.decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt-access-token') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isAllowUnauthorizedRequest = this.reflector.get<boolean>(
      AllowUnauthorizedRequestKey,
      context.getHandler(),
    );

    if (isAllowUnauthorizedRequest) return true;

    return super.canActivate(context);
  }
}
