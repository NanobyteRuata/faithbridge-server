import { ResponseDto } from './response.dto';

export class PaginatedDto<T> extends ResponseDto<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
