import { relativeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';
import { westernEaster } from '../easter.js';

/**
 * Ash Wednesday — the first day of Lent (Easter − 46 days).
 * Accepts a custom Easter observance; defaults to westernEaster.
 */
export function ashWednesday(base: Observance = westernEaster): Observance {
  return relativeObservance(base, -46);
}
