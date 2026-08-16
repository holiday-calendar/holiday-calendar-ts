import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * Civic Holiday — 1st Monday of August. No year guard: not a federally
 * legislated holiday, so no adoption-year cutoff applies (matches Java's
 * CivicHoliday, which doesn't override AbstractObservance's isValidYear).
 */
export const civicHoliday = makeObservance((year) => nthWeekdayOfMonth(year, 8, 1, 1));
