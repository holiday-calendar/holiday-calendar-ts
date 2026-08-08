import { relativeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';
import { westernEaster } from '../easter.js';

/**
 * Good Friday — the Friday before Easter Sunday (Easter − 2 days).
 * Accepts a custom Easter observance; defaults to westernEaster.
 */
export function goodFriday(base: Observance = westernEaster): Observance {
  return relativeObservance(base, -2);
}
