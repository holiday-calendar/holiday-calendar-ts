import { HolidayCalendar, fixedHoliday, floatingHoliday, relativeObservance, Temporal } from '@holiday-calendar/core';
import type { HolidayCalendarProvider } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { goodFriday } from '../observances/christian/goodFriday.js';
import { easterMonday } from '../observances/christian/easterMonday.js';
import { kingsBirthday } from '../observances/au/kingsBirthday.js';

const CODE = 'AU';
const NAME = 'Australia National Holidays';

/**
 * AU fixed-holiday roll: forward weekend substitution (Saturday -> +2,
 * Sunday -> +1), EXCEPT Christmas Day and Boxing Day on a Sunday roll +2
 * instead of +1 — because the adjacent sibling holiday (Boxing Day for
 * Christmas, or vice versa) already occupies the following Monday slot.
 * Structurally identical to ukFixedHolidayRoll (see uk.ts); verified
 * against real Australian substitute-holiday practice (Fair Work Ombudsman
 * and state government public holiday calendars, e.g. New Year's Day 2028
 * -> Mon Jan 3, Christmas/Boxing Day 2021 -> Mon Dec 27 / Tue Dec 28), which
 * shifts forward on both Saturday and Sunday. This is deliberately NOT
 * DateRolls.previousFridayOrFollowingMonday() (used by US/CH/DE/FR), whose
 * backward Saturday roll does not match Australian practice.
 *
 * Branches on the RAW (pre-roll) month/day rather than holiday identity,
 * since HolidayCalendar's DateRoll signature is (date) => date with no
 * holiday-identity parameter — same caveat as ukFixedHolidayRoll: merging
 * this calendar with another that also has a Jan 1 or Dec 25/26 fixed
 * holiday would apply this AU-specific override to that other holiday too.
 */
export function auFixedHolidayRoll(date: Temporal.PlainDate): Temporal.PlainDate {
  if (date.dayOfWeek === 6) return date.add({ days: 2 }); // Saturday -> +2
  if (date.dayOfWeek === 7) {
    const isChristmasOrBoxing = date.month === 12 && (date.day === 25 || date.day === 26);
    return date.add({ days: isChristmasOrBoxing ? 2 : 1 }); // Sunday -> +1, or +2 for Christmas/Boxing
  }
  return date;
}

/**
 * Australia national holiday calendar. Upstream Java models this same
 * 9-holiday set (`AuHolidays.baseHolidays()`) as shared with the ASX market
 * calendar (`XASX`, tracked separately), which adds early closes on top of
 * it but no additional/different national holidays.
 */
export function createAUCalendar(): HolidayCalendar {
  return new HolidayCalendar({
    code: CODE,
    name: NAME,
    dateRoll: auFixedHolidayRoll,
    weekendDays: HolidayCalendar.STANDARD_WEEKEND,
    holidays: [
      fixedHoliday({
        name: "New Year's Day",
        description: 'First day of new year in the Common Era (CE)',
        month: 1, day: 1, rollable: true,
      }),
      fixedHoliday({
        name: 'Australia Day',
        description: 'Commemoration of the 1788 arrival of the First Fleet at Port Jackson',
        month: 1, day: 26, rollable: true,
      }),
      floatingHoliday({
        name: 'Good Friday',
        description: 'Friday before Easter Sunday',
        observance: goodFriday(westernEaster), rollable: false,
      }),
      floatingHoliday({
        name: 'Easter Saturday',
        description: 'Day after Good Friday; not observed in Western Australia or Tasmania',
        observance: relativeObservance(goodFriday(westernEaster), 1), rollable: false,
      }),
      floatingHoliday({
        name: 'Easter Monday',
        description: 'Monday after Easter Sunday',
        observance: easterMonday(westernEaster), rollable: false,
      }),
      fixedHoliday({
        name: 'ANZAC Day',
        description: 'Commemoration of the Australian and New Zealand Army Corps; whether a weekend substitute is observed varies by state/territory',
        month: 4, day: 25, rollable: true,
      }),
      floatingHoliday({
        name: "King's Birthday",
        description: "King's Birthday (2nd Monday in June); Queensland uses the 1st Monday in October and Western Australia uses a late-September date",
        observance: kingsBirthday, rollable: false,
      }),
      fixedHoliday({
        name: 'Christmas Day',
        description: 'Celebration of traditional Christmas holiday',
        month: 12, day: 25, rollable: true,
      }),
      fixedHoliday({
        name: 'Boxing Day',
        description: 'Day after Christmas',
        month: 12, day: 26, rollable: true,
      }),
    ],
  });
}

export const auProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createAUCalendar(),
};
