# Rate Limiting Module

This module provides custom rate limiting decorators for the MyEcclesia Server API.

## Quick Start

### 1. Import the decorators

```typescript
import {
  ThrottleAuth,
  ThrottlePasswordReset,
  ThrottleRead,
  ThrottleWrite,
} from 'src/core/throttler/throttler.decorator';
```

### 2. Apply to your controller methods

```typescript
@Controller('profile')
export class ProfileController {
  // Read operations - 100 requests/min
  @Get()
  @ThrottleRead()
  findAll() { ... }

  @Get(':id')
  @ThrottleRead()
  findOne() { ... }

  // Write operations - 30 requests/min
  @Post()
  @ThrottleWrite()
  create() { ... }

  @Patch(':id')
  @ThrottleWrite()
  update() { ... }

  @Delete(':id')
  @ThrottleWrite()
  remove() { ... }
}
```

## Available Decorators

| Decorator | Rate Limit | Best For |
|-----------|------------|----------|
| `@ThrottleAuth()` | 5/min | Login, token refresh, authentication |
| `@ThrottlePasswordReset()` | 3/hour | Password reset, forgot password |
| `@ThrottleWrite()` | 30/min | POST, PATCH, PUT, DELETE operations |
| `@ThrottleRead()` | 100/min | GET operations |
| `@ThrottleCustom(key)` | Variable | Custom configurations |

## Configuration

Edit `throttler.config.ts` to adjust limits:

```typescript
export const THROTTLE_CONFIG = {
  auth: {
    ttl: 60000,  // Time window (ms)
    limit: 5,    // Max requests
  },
  // ... other configs
};
```

## Decorator Order

Place throttle decorators **before** guards:

```typescript
// ✅ Correct
@ThrottleWrite()
@UseGuards(JwtAuthGuard)
@Post()
create() { ... }

// ❌ Wrong
@UseGuards(JwtAuthGuard)
@ThrottleWrite()
@Post()
create() { ... }
```

## Testing Rate Limits

Use curl or any HTTP client:

```bash
# Test auth endpoint (5/min limit)
for i in {1..10}; do
  curl -X POST http://localhost:3000/user/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo ""
done
```

After 5 requests, you should receive:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Response Headers

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when limit resets

## Full Documentation

See `/RATE_LIMITING.md` in the project root for complete documentation.
