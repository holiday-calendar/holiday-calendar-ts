import { makeObservance } from '@holiday-calendar/core';
import { lastWeekdayOfMonth } from '../utils.js';

/** Summer Bank Holiday — last Monday of August, from 1971. No known exceptions. */
export const summerBankHoliday = makeObservance(
  (year) => lastWeekdayOfMonth(year, 8, 1),
  (year) => year >= 1971,
);
