import { HolidayCalendar, fixedHoliday, floatingHoliday, relativeObservance, DateRolls } from '@holiday-calendar/core';
import type { HolidayCalendarProvider } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { goodFriday } from '../observances/christian/goodFriday.js';
import { easterMonday } from '../observances/christian/easterMonday.js';
import { kingsBirthday } from '../observances/au/kingsBirthday.js';

const CODE = 'AU';
const NAME = 'Australia National Holidays';

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
    dateRoll: DateRolls.previousFridayOrFollowingMonday(),
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
        description: 'Commemoration of the Australian and New Zealand Army Corps',
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
