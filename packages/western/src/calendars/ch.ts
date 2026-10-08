import { fixedHoliday } from '@holiday-calendar/core';
import type { HolidayCalendar, HolidayCalendarProvider } from '@holiday-calendar/core';
import { createNoRollEasterCalendar } from './swissGermanHolidays.js';

const CODE = 'CH';
const NAME = 'Switzerland National Holidays';

/**
 * Switzerland national holiday calendar.
 *
 * Only Swiss National Day (Aug 1) is federally mandated, under the Federal
 * Act on the Swiss National Holiday. The remaining eight holidays reflect
 * majority-cantonal convention rather than a uniform federal statute — for
 * example, Good Friday is not observed in Ticino or Valais. This calendar
 * models the common national convention, not a per-canton breakdown.
 *
 * No weekend roll: Switzerland grants no federal substitute day when a
 * public holiday falls on a Saturday or Sunday, so every fixed holiday stays
 * on its calendar date. This deliberately differs from holiday-calendar-java
 * v2.1.0, which uses previousFridayOrFollowingMonday(); do not restore it
 * (see docs/BUILD_SPEC.md §2.3, issue #56).
 */
export function createCHCalendar(): HolidayCalendar {
  return createNoRollEasterCalendar(
    CODE,
    NAME,
    fixedHoliday({
      name: 'Swiss National Day',
      description: 'Date of the Federal Charter of 1291',
      month: 8, day: 1, rollable: false,
    }),
  );
}

export const chProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createCHCalendar(),
};
