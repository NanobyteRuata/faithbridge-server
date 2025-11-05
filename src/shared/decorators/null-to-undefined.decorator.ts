import { Transform } from 'class-transformer';

/**
 * Transforms null values to undefined.
 * Useful for optional fields where you want to ensure null is converted to undefined.
 */
export function NullToUndefined() {
  return Transform(({ value }) => (value === null ? undefined : value));
}
