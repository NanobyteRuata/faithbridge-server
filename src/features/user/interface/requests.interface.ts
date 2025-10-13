import { User } from '@prisma/client';
import { UserJwtPayload } from 'src/core/auth/interfaces/jwt-payload.interface';

// For local strategy requests
export interface LocalAuthRequest {
  user: User;
}

// For JWT strategy requests
export interface JwtAuthRequest {
  user: UserJwtPayload;
}

// For JWT refresh strategy requests
export interface JwtRefreshRequest {
  user: UserJwtPayload & {
    refreshToken: string;
  };
}
