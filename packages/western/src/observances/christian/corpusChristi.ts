import { relativeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';
import { westernEaster } from '../easter.js';

/**
 * Corpus Christi — celebrated on the Thursday 60 days after Easter, or, when
 * adjustToSunday is true, on the following Sunday (Easter + 63 days).
 * Accepts a custom Easter observance; defaults to westernEaster.
 */
export function corpusChristi(base: Observance = westernEaster, adjustToSunday = false): Observance {
  return relativeObservance(base, adjustToSunday ? 63 : 60);
}
