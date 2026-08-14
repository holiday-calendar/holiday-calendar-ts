import { relativeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';
import { westernEaster } from '../easter.js';

/**
 * Easter Monday — the day after Easter Sunday (Easter + 1 day).
 * Accepts a custom Easter observance; defaults to westernEaster.
 */
export function easterMonday(base: Observance = westernEaster): Observance {
  return relativeObservance(base, 1);
}
