import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * Columbus Day — 2nd Monday of October, from 1971 onward (Uniform Monday Holiday Act).
 */
export const columbusDay = makeObservance(
  (year) => nthWeekdayOfMonth(year, 10, 1, 2),
  (year) => year >= 1971,
);
