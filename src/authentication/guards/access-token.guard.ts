import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt-access-token') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    const isAllowUnauthorizedRequest = this.reflector.get<boolean>(
      'allow-unauthorized-request',
      context.getHandler(),
    );

    if (isAllowUnauthorizedRequest) {
      if (context.switchToHttp().getRequest().headers.authorization) {
        return super.handleRequest(err, user, info, context, status);
      }

      if (err || !user) return null;
    }

    return super.handleRequest(err, user, info, context, status);
  }

  // canActivate(
  //   context: ExecutionContext,
  // ): boolean | Promise<boolean> | Observable<boolean> {
  //   const isAllowUnauthorizedRequest = this.reflector.get<boolean>(
  //     AllowUnauthorizedRequestKey,
  //     context.getHandler(),
  //   );

  //   if (isAllowUnauthorizedRequest) return true;

  //   return super.canActivate(context);
  // }
}
