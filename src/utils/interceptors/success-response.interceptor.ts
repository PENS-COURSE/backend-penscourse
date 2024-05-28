import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (
      this.reflector.get<boolean>(
        'withoutModifiedResponse',
        context.getHandler(),
      )
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        message: data.message ?? 'Successfully retrieved data',
        statusCode: context.switchToHttp().getResponse().statusCode,
        data: data.data || null,
      })),
    );
  }
}
