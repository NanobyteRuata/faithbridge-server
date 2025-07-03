export class PaginatedDto<T> {
  data: T[];
  meta: PaginatedMeta;
}

export class PaginatedMeta {
  page: number;
  limit: number;
  total: number;
}
