export class ResponseDto<T> {
  data?: T;
  error?: unknown;
  success: boolean;
}
