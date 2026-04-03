import { Temporal, makeObservance } from '@holiday-calendar/core';
import { nthWeekdayOfMonth } from '../utils.js';

/**
 * Presidents' Day (Washington's Birthday) — observed from 1879 onward.
 * Pre-1971: fixed on February 22.
 * From 1971: 3rd Monday of February (Uniform Monday Holiday Act).
 */
export const presidentsDay = makeObservance(
  (year) =>
    year < 1971
      ? Temporal.PlainDate.from({ year, month: 2, day: 22 })
      : nthWeekdayOfMonth(year, 2, 1, 3),
  (year) => year >= 1879,
);
