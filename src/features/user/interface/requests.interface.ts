import { User } from '@prisma/client';

// For local strategy requests
export interface LocalAuthRequest {
  user: User;
}

// For JWT strategy requests
export interface JwtAuthRequest {
  user: {
    sub: number;
    username: string;
  };
}

// For JWT refresh strategy requests
export interface JwtRefreshRequest {
  user: {
    sub: number;
    username: string;
    refreshToken: string;
  };
}
