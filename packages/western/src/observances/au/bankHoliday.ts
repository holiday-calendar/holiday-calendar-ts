import { makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * NSW Bank Holiday — 1st Monday of August.
 *
 * A New South Wales-only bank holiday (Banks and Bank Holidays Act 1912),
 * not a national public holiday; it is carried only by the `AUD` (RBA)
 * settlement calendar. No year guard, matching Java's `BankHoliday`.
 */
export const nswBankHoliday = makeObservance((year) => nthWeekdayOfMonth(year, 8, 1, 1));
