import { Temporal } from '@holiday-calendar/core';

/**
 * Returns the nth occurrence of a given ISO day-of-week within a month.
 *
 * @param year   - The year
 * @param month  - 1–12
 * @param dayOfWeek - ISO day: 1=Monday … 7=Sunday
 * @param n      - 1-based ordinal (1=first, 2=second, …)
 */
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  n: number,
): Temporal.PlainDate {
  const first = Temporal.PlainDate.from({ year, month, day: 1 });
  const diff = (dayOfWeek - first.dayOfWeek + 7) % 7;
  return first.add({ days: diff + (n - 1) * 7 });
}

/**
 * Returns the last occurrence of a given ISO day-of-week within a month.
 *
 * @param year   - The year
 * @param month  - 1–12
 * @param dayOfWeek - ISO day: 1=Monday … 7=Sunday
 */
export function lastWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
): Temporal.PlainDate {
  const last = Temporal.PlainDate.from({ year, month, day: 1 })
    .add({ months: 1 })
    .subtract({ days: 1 });
  const diff = (last.dayOfWeek - dayOfWeek + 7) % 7;
  return last.subtract({ days: diff });
}

/**
 * Returns the given ISO day-of-week immediately preceding `date`, strictly
 * before it (never returns `date` itself, even if `date` already falls on
 * that day-of-week).
 *
 * @param date      - The reference date
 * @param dayOfWeek - ISO day: 1=Monday … 7=Sunday
 */
export function weekdayImmediatelyBefore(
  date: Temporal.PlainDate,
  dayOfWeek: number,
): Temporal.PlainDate {
  const diff = (date.dayOfWeek - dayOfWeek + 7) % 7 || 7;
  return date.subtract({ days: diff });
}
