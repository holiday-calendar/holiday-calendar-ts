import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * Labor Day — 1st Monday of September, from 1894 onward.
 */
export const laborDay = makeObservance(
  (year) => nthWeekdayOfMonth(year, 9, 1, 1),
  (year) => year >= 1894,
);
