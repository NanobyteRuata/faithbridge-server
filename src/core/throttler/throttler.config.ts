/**
 * Rate Limiting Configuration
 * 
 * Defines different rate limits for various endpoint types:
 * - strict: Authentication endpoints (login, register, password reset)
 * - moderate: Write operations (create, update, delete)
 * - relaxed: Read operations (get, list)
 */

export const THROTTLE_CONFIG = {
  // Authentication endpoints - very strict
  auth: {
    ttl: 60000, // 1 minute
    limit: 5, // 5 attempts per minute
  },

  // Password reset - strict to prevent abuse
  passwordReset: {
    ttl: 3600000, // 1 hour
    limit: 3, // 3 attempts per hour
  },

  // Write operations - moderate
  write: {
    ttl: 60000, // 1 minute
    limit: 30, // 30 requests per minute
  },

  // Read operations - relaxed
  read: {
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },

  // Default for all other endpoints
  default: {
    ttl: 60000, // 1 minute
    limit: 60, // 60 requests per minute
  },
} as const;

export type ThrottleConfigKey = keyof typeof THROTTLE_CONFIG;
