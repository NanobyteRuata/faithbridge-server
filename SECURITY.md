# Security Best Practices Implementation

This document outlines the security measures implemented in the FaithBridge Server application.

## 🔒 Authentication & Authorization

### JWT Token Security

#### Unique Token Identifiers (JTI)
- **Implementation**: Each JWT token includes a unique identifier (`jti`) using UUID v4
- **Purpose**: Prevents token collisions when multiple tokens are generated simultaneously
- **Location**: `src/features/user/user.service.ts` - `generateTokens()` method

```typescript
const accessTokenId = uuidv4();
const refreshTokenId = uuidv4();
const timestamp = Date.now();
```

#### Refresh Token Rotation
- **Implementation**: When a refresh token is used, it's immediately invalidated and replaced with a new one
- **Purpose**: Prevents token reuse and limits the window of vulnerability
- **Location**: `src/features/user/user.service.ts` - `refreshTokens()` method

#### Token Reuse Detection
- **Implementation**: If an already-used refresh token is presented, all sessions for that device are invalidated
- **Purpose**: Detects potential token theft and protects user accounts
- **Behavior**: 
  - Logs warning with user ID and device ID
  - Deletes all sessions for the compromised device
  - Returns 401 Unauthorized

```typescript
if (!session) {
  this.logger.warn(`Potential token reuse detected for user ${userId} on device ${deviceId}`);
  await this.prisma.session.deleteMany({ where: { userId, deviceId } });
  throw new UnauthorizedException('Invalid refresh token');
}
```

### Session Management

#### Automatic Session Cleanup
- **Implementation**: CRON job runs daily at midnight (UTC)
- **Purpose**: Removes expired sessions from the database
- **Location**: `src/features/user/services/session-cleanup.service.ts`
- **Schedule**: Configurable via `@Cron` decorator

#### Session Storage
- **Database**: All refresh tokens are stored in the `Session` table
- **Expiration**: Sessions have an `expiresAt` timestamp
- **Device Tracking**: Each session is tied to a specific device ID

## 🔐 Password Security

### Password Hashing
- **Algorithm**: bcrypt with salt rounds = 10
- **Implementation**: All passwords are hashed before storage
- **Locations**:
  - User registration: `user.service.ts` - `register()` method
  - Password reset: `user.service.ts` - `resetPasswordWithCode()` method
  - Password update: `user.service.ts` - `updateOrgUser()` method

### Password Strength Requirements
- **Minimum Length**: 8 characters
- **Maximum Length**: 100 characters
- **Complexity Requirements**:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%*?&)

**Validation Pattern**:
```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]
```

**Applied to**:
- User registration (`RegisterDto`)
- Password reset (`ResetPasswordDto`)

## 🛡️ Security Headers

### Helmet Configuration
- **Package**: `helmet`
- **Purpose**: Sets secure HTTP headers
- **Location**: `src/main.ts`
- **Headers Set**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy`

## 🚦 Rate Limiting

### Tiered Rate Limiting
- **Package**: `@nestjs/throttler`
- **Configuration**: Custom decorators for different endpoint types
- **Location**: `src/core/throttler/`
- **Documentation**: See `RATE_LIMITING.md` for full details

### Rate Limit Tiers

| Tier | Limit | Use Case |
|------|-------|----------|
| **Auth** | 5/min | Login, token refresh |
| **Password Reset** | 3/hour | Forgot/reset password |
| **Write** | 30/min | Create, update, delete |
| **Read** | 100/min | Get, list operations |
| **Default** | 60/min | All other endpoints |

### Implementation

```typescript
// Authentication endpoints
@ThrottleAuth()
@Post('login')
login() { ... }

// Password reset
@ThrottlePasswordReset()
@Post('forgot-password')
forgotPassword() { ... }

// Write operations
@ThrottleWrite()
@Post()
create() { ... }

// Read operations
@ThrottleRead()
@Get()
findAll() { ... }
```

### Applied To
- ✅ User authentication endpoints (login, refresh, logout)
- ✅ Password reset endpoints (forgot, reset)
- ✅ User management endpoints (CRUD operations)
- 📋 Other controllers: Apply as needed using decorators

## 🔍 Input Validation

### Global Validation Pipe
- **Package**: `class-validator`
- **Configuration**:
  - `whitelist: true` - Strips properties not defined in DTOs
  - `forbidNonWhitelisted: true` - Throws error for unexpected properties
  - `transform: true` - Automatically transforms payloads to DTO instances

### SQL Injection Prevention
- **ORM**: Prisma
- **Protection**: All queries use parameterized statements
- **No Raw SQL**: Avoid `$queryRaw` and `$executeRaw` unless absolutely necessary

## 🌐 CORS Configuration

### Cross-Origin Resource Sharing
- **Configuration**: `src/main.ts`
- **Allowed Origins**: Configurable via `CORS_ALLOW_ORIGIN` environment variable
- **Credentials**: Enabled for cookie-based authentication
- **Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization

```typescript
const allowedOrigins = process.env.CORS_ALLOW_ORIGIN?.split(',') || ['*'];
app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## 📧 Email Security

### Password Reset Flow
1. User requests password reset with email
2. 6-digit random code generated
3. Code expires after configured time
4. Code stored hashed in database
5. Email sent with code
6. User submits code + new password
7. Password is hashed before storage
8. Reset code is cleared

### Email Service
- **Provider**: SendGrid
- **Configuration**: API key stored in environment variables
- **Location**: `src/shared/services/email.service.ts`

## 🔑 Environment Variables

### Required Security Variables
```env
# JWT Secrets (use strong, random strings)
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# JWT Expiration
JWT_ACCESS_EXPIRE_IN=15m
JWT_REFRESH_EXPIRE_IN=7d

# CORS
CORS_ALLOW_ORIGIN=http://localhost:3000,https://yourdomain.com

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM=noreply@yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

## 🚨 Security Checklist

### Before Deployment
- [ ] Change all default secrets and API keys
- [ ] Set strong JWT secrets (minimum 32 characters)
- [ ] Configure CORS to allow only trusted origins
- [ ] Enable HTTPS in production
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Review and adjust rate limits
- [ ] Set up security alerts
- [ ] Enable database connection pooling
- [ ] Configure session timeout appropriately

### Regular Maintenance
- [ ] Rotate JWT secrets periodically
- [ ] Review and update dependencies
- [ ] Monitor security logs for suspicious activity
- [ ] Audit user sessions regularly
- [ ] Review and update password policies
- [ ] Test backup and recovery procedures

## 🐛 Reporting Security Issues

If you discover a security vulnerability, please email security@yourdomain.com. Do not create public GitHub issues for security vulnerabilities.

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)

## 📝 Version History

- **v1.0.0** (2025-11-08): Initial security implementation
  - JWT token rotation
  - Token reuse detection
  - Password strength validation
  - Rate limiting
  - Security headers
  - Session cleanup CRON job
