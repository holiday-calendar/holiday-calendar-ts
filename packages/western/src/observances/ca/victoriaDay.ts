import { Temporal, makeObservance } from '@holiday-calendar/core';
import { weekdayImmediatelyBefore } from '../utils.js';

/**
 * Victoria Day — the Monday strictly before May 25, observed from 1845
 * onward. Equivalent to Java's "last Monday of May, minus one week", since
 * the last Monday of May always falls in [May 25, May 31].
 */
export const victoriaDay = makeObservance(
  (year) => weekdayImmediatelyBefore(Temporal.PlainDate.from({ year, month: 5, day: 25 }), 1),
  (year) => year >= 1845,
);
