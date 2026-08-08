import { Temporal, makeObservance } from '@holiday-calendar/core';
import { lastWeekdayOfMonth } from '../utils.js';

/**
 * Memorial Day — observed from 1868 onward.
 * Pre-1971: fixed on May 30.
 * From 1971: last Monday of May (Uniform Monday Holiday Act).
 */
export const memorialDay = makeObservance(
  (year) =>
    year < 1971
      ? Temporal.PlainDate.from({ year, month: 5, day: 30 })
      : lastWeekdayOfMonth(year, 5, 1),
  (year) => year >= 1868,
);
