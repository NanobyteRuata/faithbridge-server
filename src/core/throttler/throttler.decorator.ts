import { Throttle } from '@nestjs/throttler';
import { THROTTLE_CONFIG, ThrottleConfigKey } from './throttler.config';

/**
 * Custom throttle decorators for different endpoint types
 */

export const ThrottleAuth = () =>
  Throttle({ default: THROTTLE_CONFIG.auth });

export const ThrottlePasswordReset = () =>
  Throttle({ default: THROTTLE_CONFIG.passwordReset });

export const ThrottleWrite = () =>
  Throttle({ default: THROTTLE_CONFIG.write });

export const ThrottleRead = () =>
  Throttle({ default: THROTTLE_CONFIG.read });

export const ThrottleCustom = (key: ThrottleConfigKey) =>
  Throttle({ default: THROTTLE_CONFIG[key] });
