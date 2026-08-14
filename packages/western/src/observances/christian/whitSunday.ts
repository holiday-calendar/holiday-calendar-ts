import { relativeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';
import { westernEaster } from '../easter.js';

/**
 * Whit Sunday (Pentecost) — the 7th Sunday after Easter (Easter + 49 days).
 * Accepts a custom Easter observance; defaults to westernEaster.
 */
export function whitSunday(base: Observance = westernEaster): Observance {
  return relativeObservance(base, 49);
}
