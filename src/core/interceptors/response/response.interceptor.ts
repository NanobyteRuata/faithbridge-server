import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedDto } from 'src/shared/dto/response/paginated.dto';
import { ResponseDto } from 'src/shared/dto/response/response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T> | PaginatedDto<T>> {
    return next.handle().pipe(
      map((data) => {
        if (!data) {
          throw new NotFoundException('Not Found');
        }

        if (typeof data === 'object' && 'data' in data && 'meta' in data) {
          return data as PaginatedDto<T>;
        }
        return {
          data: data as T,
          success: true,
        };
      }),
    );
  }
}
