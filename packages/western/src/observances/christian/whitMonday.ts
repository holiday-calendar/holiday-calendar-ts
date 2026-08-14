import { relativeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';
import { westernEaster } from '../easter.js';

/**
 * Whit Monday — the day after Whit Sunday (Easter + 50 days).
 * Accepts a custom Easter observance; defaults to westernEaster.
 */
export function whitMonday(base: Observance = westernEaster): Observance {
  return relativeObservance(base, 50);
}
