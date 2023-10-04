import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        message: data.message ?? 'Successfully retrieved data',
        statusCode: context.switchToHttp().getResponse().statusCode,
        data: data.data || null,
      })),
    );
  }
}
