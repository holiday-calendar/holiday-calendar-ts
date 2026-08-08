import { HolidayCalendar, fixedHoliday, floatingHoliday } from '@holiday-calendar/core';
import type { HolidayCalendarProvider } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { goodFriday } from '../observances/christian/goodFriday.js';
import { martinLutherKingJrDay } from '../observances/us/martinLutherKingJrDay.js';
import { presidentsDay } from '../observances/us/presidentsDay.js';
import { memorialDay } from '../observances/us/memorialDay.js';
import { laborDay } from '../observances/us/laborDay.js';
import { columbusDay } from '../observances/us/columbusDay.js';
import { thanksgiving } from '../observances/us/thanksgiving.js';
import { dayAfterThanksgiving } from '../observances/us/dayAfterThanksgiving.js';

const CODE = 'US';
const NAME = 'United States National Holidays';

export function createUSCalendar(): HolidayCalendar {
  return new HolidayCalendar({
    code: CODE,
    name: NAME,
    // Saturday → previous Friday, Sunday → following Monday
    dateRoll: (date) => {
      if (date.dayOfWeek === 6) return date.subtract({ days: 1 });
      if (date.dayOfWeek === 7) return date.add({ days: 1 });
      return date;
    },
    weekendDays: HolidayCalendar.STANDARD_WEEKEND,
    holidays: [
      fixedHoliday({
        name: "New Year's Day",
        description: 'First day of new year in the Common Era (CE)',
        month: 1, day: 1, rollable: true,
      }),
      floatingHoliday({
        name: 'Martin Luther King Jr. Day',
        description: 'Observed birthday of Martin Luther King, Jr.',
        observance: martinLutherKingJrDay, rollable: false,
      }),
      floatingHoliday({
        name: "Presidents' Day",
        description: 'Commemoration of Presidents of the United States',
        observance: presidentsDay, rollable: false,
      }),
      floatingHoliday({
        name: 'Good Friday',
        description: 'Good Friday (NYSE market closure by convention)',
        observance: goodFriday(westernEaster), rollable: false,
      }),
      floatingHoliday({
        name: 'Memorial Day',
        description: 'Commemoration of fallen service members of US armed forces',
        observance: memorialDay, rollable: false,
      }),
      fixedHoliday({
        name: 'Juneteenth',
        description: 'Commemoration of emancipation of African-American slaves',
        month: 6, day: 19, rollable: true,
      }),
      fixedHoliday({
        name: 'Independence Day',
        description: 'Celebration of US Declaration of Independence',
        month: 7, day: 4, rollable: true,
      }),
      floatingHoliday({
        name: 'Labor Day',
        description: 'US Labor Day',
        observance: laborDay, rollable: false,
      }),
      floatingHoliday({
        name: 'Columbus Day',
        description: 'Anniversary of the arrival of Christopher Columbus in the Americas',
        observance: columbusDay, rollable: false,
      }),
      fixedHoliday({
        name: 'Veterans Day',
        description: 'Commemoration of all US veterans of foreign wars',
        month: 11, day: 11, rollable: true,
      }),
      floatingHoliday({
        name: 'Thanksgiving',
        description: 'Day to give thanks',
        observance: thanksgiving, rollable: false,
      }),
      floatingHoliday({
        name: 'Day After Thanksgiving',
        description: 'Day after Thanksgiving (NYSE market closure by convention)',
        observance: dayAfterThanksgiving, rollable: false,
      }),
      fixedHoliday({
        name: 'Christmas Day',
        description: 'Celebration of traditional Christmas holiday',
        month: 12, day: 25, rollable: true,
      }),
    ],
  });
}

export const usProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createUSCalendar(),
};
