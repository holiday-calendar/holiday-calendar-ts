import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * King's Birthday — 2nd Monday of June.
 *
 * This is the national-default convention used by most Australian states
 * and territories. Queensland observes the 1st Monday of October instead,
 * and Western Australia observes a governor-proclaimed date in late
 * September; neither is modeled here.
 */
export const kingsBirthday = makeObservance((year) => nthWeekdayOfMonth(year, 6, 1, 2));
