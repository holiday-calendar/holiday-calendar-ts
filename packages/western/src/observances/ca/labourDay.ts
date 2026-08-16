import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * Labour Day — 1st Monday of September, observed from 1894 onward.
 */
export const labourDay = makeObservance(
  (year) => nthWeekdayOfMonth(year, 9, 1, 1),
  (year) => year >= 1894,
);
