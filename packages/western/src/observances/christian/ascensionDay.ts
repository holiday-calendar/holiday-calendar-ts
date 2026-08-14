import { relativeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';
import { westernEaster } from '../easter.js';

/**
 * Ascension Day — the 40th day of Easter, commemorating Christ's ascension
 * (Easter + 39 days). Accepts a custom Easter observance; defaults to westernEaster.
 */
export function ascensionDay(base: Observance = westernEaster): Observance {
  return relativeObservance(base, 39);
}
