import { HolidayCalendar, fixedHoliday, floatingHoliday, DateRolls } from '@holiday-calendar/core';
import type { Holiday } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { goodFriday } from '../observances/christian/goodFriday.js';
import { easterMonday } from '../observances/christian/easterMonday.js';
import { ascensionDay } from '../observances/christian/ascensionDay.js';
import { whitMonday } from '../observances/christian/whitMonday.js';

/**
 * Builds a no-roll calendar from the holidays shared by CH and DE (New Year's
 * Day, Good Friday, Easter Monday, Labour Day, Ascension Day, Whit Monday,
 * Christmas Day, Boxing Day) plus the one country-specific national day.
 */
export function createNoRollEasterCalendar(
  code: string,
  name: string,
  nationalDay: Holiday,
): HolidayCalendar {
  return new HolidayCalendar({
    code,
    name,
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
      nationalDay,
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
