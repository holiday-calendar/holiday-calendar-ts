import { HolidayCalendar, fixedHoliday, floatingHoliday, DateRolls } from '@holiday-calendar/core';
import type { HolidayCalendarProvider } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { goodFriday } from '../observances/christian/goodFriday.js';
import { easterMonday } from '../observances/christian/easterMonday.js';
import { ascensionDay } from '../observances/christian/ascensionDay.js';
import { whitMonday } from '../observances/christian/whitMonday.js';

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
  return new HolidayCalendar({
    code: CODE,
    name: NAME,
    dateRoll: DateRolls.noRoll(),
    weekendDays: HolidayCalendar.STANDARD_WEEKEND,
    holidays: [
      fixedHoliday({
        name: "New Year's Day",
        description: 'First day of new year in the Common Era (CE)',
        month: 1, day: 1, rollable: false,
      }),
      floatingHoliday({
        name: 'Good Friday',
        description: 'Friday before Easter Sunday',
        observance: goodFriday(westernEaster), rollable: false,
      }),
      floatingHoliday({
        name: 'Easter Monday',
        description: 'Monday after Easter Sunday',
        observance: easterMonday(westernEaster), rollable: false,
      }),
      fixedHoliday({
        name: 'Labour Day',
        description: "International Workers' Day",
        month: 5, day: 1, rollable: false,
      }),
      floatingHoliday({
        name: 'Ascension Day',
        description: "The 40th day of Easter; Jesus Christ's ascension into heaven",
        observance: ascensionDay(westernEaster), rollable: false,
      }),
      floatingHoliday({
        name: 'Whit Monday',
        description: 'Monday after Whit Sunday (Pentecost)',
        observance: whitMonday(westernEaster), rollable: false,
      }),
      fixedHoliday({
        name: 'Swiss National Day',
        description: 'Date of the Federal Charter of 1291',
        month: 8, day: 1, rollable: false,
      }),
      fixedHoliday({
        name: 'Christmas Day',
        description: 'Celebration of traditional Christmas holiday',
        month: 12, day: 25, rollable: false,
      }),
      fixedHoliday({
        name: 'Boxing Day',
        description: 'Day after Christmas',
        month: 12, day: 26, rollable: false,
      }),
    ],
  });
}

export const chProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createCHCalendar(),
};
