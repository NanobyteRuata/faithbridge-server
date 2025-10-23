import { UserJwtPayload } from 'src/core/auth/interfaces/jwt-payload.interface';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  jwtPayload?: UserJwtPayload;
}
