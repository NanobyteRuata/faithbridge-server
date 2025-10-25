import { User } from '@prisma/client';
import { UserJwtPayload } from 'src/core/auth/interfaces/jwt-payload.interface';
import { AccessCodePayload } from 'src/core/auth/interfaces/access-code-payload.interface';

// For local strategy requests
export interface LocalAuthRequest {
  user: User;
}

// For JWT strategy requests
export interface JwtAuthRequest {
  user: UserJwtPayload;
}

export interface AccessCodeRequest {
  user: AccessCodePayload;
}

export interface HybridAuthRequest {
  user: UserJwtPayload | AccessCodePayload;
}

// For JWT refresh strategy requests
export interface JwtRefreshRequest {
  user: UserJwtPayload & {
    refreshToken: string;
  };
}
