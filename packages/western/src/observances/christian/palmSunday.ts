import { relativeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';
import { westernEaster } from '../easter.js';

/**
 * Palm Sunday — the Sunday before Easter, marking the start of Holy Week
 * (Easter − 7 days). Accepts a custom Easter observance; defaults to westernEaster.
 */
export function palmSunday(base: Observance = westernEaster): Observance {
  return relativeObservance(base, -7);
}
