import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * Canadian Thanksgiving Day — 2nd Monday of October. No year guard (matches
 * Java's Thanksgiving, which doesn't override AbstractObservance's
 * isValidYear). Distinct from US Thanksgiving (4th Thursday of November).
 */
export const thanksgiving = makeObservance((year) => nthWeekdayOfMonth(year, 10, 1, 2));
