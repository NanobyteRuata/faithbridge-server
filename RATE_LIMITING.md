# Rate Limiting Configuration

This document describes the rate limiting implementation in the FaithBridge Server application.

## Overview

Rate limiting is implemented using `@nestjs/throttler` with custom decorators for different endpoint types. This prevents abuse, brute-force attacks, and ensures fair resource usage.

## Configuration

### Rate Limit Tiers

Located in `src/core/throttler/throttler.config.ts`:

| Tier | TTL | Limit | Use Case |
|------|-----|-------|----------|
| **Auth** | 60s | 5 requests | Login, token refresh |
| **Password Reset** | 1 hour | 3 requests | Forgot/reset password |
| **Write** | 60s | 30 requests | Create, update, delete operations |
| **Read** | 60s | 100 requests | Get, list operations |
| **Default** | 60s | 60 requests | All other endpoints |

## Usage

### Custom Decorators

Import from `src/core/throttler/throttler.decorator.ts`:

```typescript
import {
  ThrottleAuth,
  ThrottlePasswordReset,
  ThrottleRead,
  ThrottleWrite,
  ThrottleCustom,
} from 'src/core/throttler/throttler.decorator';
```

### Examples

#### Authentication Endpoints
```typescript
@ThrottleAuth()
@Post('login')
login() { ... }
```

#### Password Reset
```typescript
@ThrottlePasswordReset()
@Post('forgot-password')
forgotPassword() { ... }
```

#### Write Operations
```typescript
@ThrottleWrite()
@Post()
create() { ... }

@ThrottleWrite()
@Patch(':id')
update() { ... }

@ThrottleWrite()
@Delete(':id')
remove() { ... }
```

#### Read Operations
```typescript
@ThrottleRead()
@Get()
findAll() { ... }

@ThrottleRead()
@Get(':id')
findOne() { ... }
```

#### Custom Configuration
```typescript
@ThrottleCustom('auth')
@Post('sensitive-endpoint')
sensitiveOperation() { ... }
```

## Applied Endpoints

### User Controller (`/user`)

| Endpoint | Method | Rate Limit |
|----------|--------|------------|
| `/user` | GET | Read (100/min) |
| `/user/self` | GET | Read (100/min) |
| `/user/:id` | GET | Read (100/min) |
| `/user/register` | POST | Write (30/min) |
| `/user/:id` | PATCH | Write (30/min) |
| `/user/self` | PATCH | Write (30/min) |
| `/user/login` | POST | Auth (5/min) |
| `/user/refresh` | POST | Auth (5/min) |
| `/user/logout` | POST | Write (30/min) |
| `/user/logout-all` | POST | Write (30/min) |
| `/user/forgot-password` | POST | Password Reset (3/hour) |
| `/user/reset-password` | POST | Password Reset (3/hour) |

## Extending to Other Controllers

To apply rate limiting to other controllers:

1. Import the appropriate decorator:
```typescript
import { ThrottleRead, ThrottleWrite } from 'src/core/throttler/throttler.decorator';
```

2. Apply to endpoints:
```typescript
@Controller('profile')
export class ProfileController {
  @Get()
  @ThrottleRead()
  findAll() { ... }

  @Post()
  @ThrottleWrite()
  create() { ... }
}
```

## Customizing Limits

To adjust rate limits, edit `src/core/throttler/throttler.config.ts`:

```typescript
export const THROTTLE_CONFIG = {
  auth: {
    ttl: 60000,  // Time window in milliseconds
    limit: 5,    // Max requests per window
  },
  // ... other configs
};
```

## Response Headers

When rate limited, the API returns:
- **Status Code**: `429 Too Many Requests`
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

## Best Practices

1. **Authentication endpoints**: Use `@ThrottleAuth()` - very strict
2. **Password operations**: Use `@ThrottlePasswordReset()` - prevents abuse
3. **Write operations**: Use `@ThrottleWrite()` - moderate limits
4. **Read operations**: Use `@ThrottleRead()` - relaxed limits
5. **Public endpoints**: Consider stricter limits
6. **Admin endpoints**: Can use relaxed limits with proper authentication

## Monitoring

Monitor rate limit hits in your logs to:
- Identify potential attacks
- Adjust limits based on usage patterns
- Detect legitimate users hitting limits

## Production Considerations

1. **IP-based limiting**: Current implementation uses IP addresses
2. **User-based limiting**: Consider adding user-specific limits
3. **Redis storage**: For distributed systems, configure Redis storage:
   ```typescript
   ThrottlerModule.forRoot({
     storage: new ThrottlerStorageRedisService(redisClient),
   })
   ```
4. **Monitoring**: Set up alerts for high rate limit violations
5. **Whitelisting**: Consider whitelisting trusted IPs/users

## Troubleshooting

### Users hitting limits legitimately
- Increase limits for specific endpoints
- Implement user-based limits instead of IP-based
- Add authentication-based exemptions

### Rate limits not working
- Verify `ThrottlerGuard` is registered globally in `app.module.ts`
- Check decorator order (throttle decorator should be before guards)
- Ensure `@nestjs/throttler` is properly installed

### Different limits for different user roles
Implement custom guard:
```typescript
@Injectable()
export class RoleBasedThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    // Custom logic based on user role
  }
}
```

## Version History

- **v1.0.0** (2025-11-10): Initial rate limiting implementation
  - Custom decorators for different endpoint types
  - Applied to user authentication endpoints
  - Configurable limits per tier
