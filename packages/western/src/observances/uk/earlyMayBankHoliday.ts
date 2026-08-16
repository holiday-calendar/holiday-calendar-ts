import { makeObservance, Temporal } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * Early May Bank Holiday — normally the 1st Monday of May, from 1978.
 * Overridden to 8 May in 1995 and 2020 (VE Day 50th/75th anniversary),
 * displacing the formula date (1 May 1995 / 4 May 2020). This is a one-off
 * VALUE override, not an eligibility change, so it's branched inside
 * compute() rather than isValidYear — isValidYear can only express
 * null/absent, not "a different date this year."
 */
export const earlyMayBankHoliday = makeObservance(
  (year) => {
    if (year === 1995 || year === 2020) {
      return Temporal.PlainDate.from({ year, month: 5, day: 8 });
    }
    return nthWeekdayOfMonth(year, 5, 1, 1);
  },
  (year) => year >= 1978,
);
