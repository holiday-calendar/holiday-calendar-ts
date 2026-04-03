import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * Martin Luther King Jr. Day — 3rd Monday of January.
 * Observed as a US federal holiday from 1986 onward.
 */
export const martinLutherKingJrDay = makeObservance(
  (year) => nthWeekdayOfMonth(year, 1, 1, 3),
  (year) => year >= 1986,
);
