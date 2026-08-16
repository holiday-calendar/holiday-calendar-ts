import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * Family Day — 3rd Monday of February, observed from 1990 onward.
 */
export const familyDay = makeObservance(
  (year) => nthWeekdayOfMonth(year, 2, 1, 3),
  (year) => year >= 1990,
);
