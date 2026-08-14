import { relativeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';
import { westernEaster } from '../easter.js';

/**
 * Shrove Tuesday — the day before Ash Wednesday (Easter − 47 days).
 * Accepts a custom Easter observance; defaults to westernEaster.
 */
export function shroveTuesday(base: Observance = westernEaster): Observance {
  return relativeObservance(base, -47);
}
