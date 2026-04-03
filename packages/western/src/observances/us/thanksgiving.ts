import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth, lastWeekdayOfMonth } from '../utils.js';

/**
 * US Thanksgiving — observed from 1863 onward.
 * Pre-1942: last Thursday of November.
 * From 1942: 4th Thursday of November.
 */
export const thanksgiving = makeObservance(
  (year) =>
    year < 1942
      ? lastWeekdayOfMonth(year, 11, 4) // last Thursday
      : nthWeekdayOfMonth(year, 11, 4, 4), // 4th Thursday
  (year) => year >= 1863,
);
