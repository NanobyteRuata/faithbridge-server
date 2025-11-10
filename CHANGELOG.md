# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-11-10

### Added
- **Rate Limiting System**: Implemented tiered rate limiting with custom decorators
  - `@ThrottleAuth()`: 5 requests/min for authentication endpoints
  - `@ThrottlePasswordReset()`: 3 requests/hour for password operations
  - `@ThrottleWrite()`: 30 requests/min for write operations
  - `@ThrottleRead()`: 100 requests/min for read operations
  - Default: 60 requests/min for all other endpoints
- Rate limiting configuration in `src/core/throttler/`
- Comprehensive rate limiting documentation in `RATE_LIMITING.md`
- Applied rate limiting to all user controller endpoints

### Changed
- Updated `SECURITY.md` with new rate limiting implementation details
- Updated `README.md` to reference security and rate limiting documentation
- Changed `console.log` to `console.warn` in delete operations across services (temporary until activity logging is implemented)

### Removed
- All test files (`*.spec.ts`) - testing to be implemented in future
- Test directory and e2e tests
- Test-related scripts from `package.json`:
  - `test`, `test:watch`, `test:cov`, `test:debug`, `test:e2e`
- Jest configuration from `package.json`
- Test file patterns from format and lint scripts

### Security
- Enhanced protection against brute-force attacks on authentication endpoints
- Strict rate limiting on password reset to prevent abuse
- Per-endpoint rate limiting based on operation sensitivity

## [0.0.1] - 2025-11-08

### Added
- Initial security implementation
  - JWT token rotation and reuse detection
  - Password strength validation
  - Helmet security headers
  - Basic rate limiting (10 req/60s globally)
  - Session cleanup CRON job
  - Multi-tenancy support
