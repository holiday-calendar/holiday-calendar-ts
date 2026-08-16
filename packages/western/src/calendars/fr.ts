import { HolidayCalendar, fixedHoliday, floatingHoliday, DateRolls } from '@holiday-calendar/core';
import type { HolidayCalendarProvider } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { easterMonday } from '../observances/christian/easterMonday.js';
import { ascensionDay } from '../observances/christian/ascensionDay.js';
import { whitMonday } from '../observances/christian/whitMonday.js';

const CODE = 'FR';
const NAME = 'France National Holidays';

export function createFRCalendar(): HolidayCalendar {
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
      floatingHoliday({
        name: 'Easter Monday',
        description: 'Day after Easter Sunday',
        observance: easterMonday(westernEaster), rollable: false,
      }),
      fixedHoliday({
        name: 'Labour Day',
        description: 'Celebration of workers and labour',
        month: 5, day: 1, rollable: true,
      }),
      fixedHoliday({
        name: 'Victory in Europe Day',
        description: 'Commemoration of the Allied victory over Nazi Germany in 1945',
        month: 5, day: 8, rollable: true,
      }),
      floatingHoliday({
        name: 'Ascension Day',
        description: "Commemoration of the ascension of Jesus Christ into heaven",
        observance: ascensionDay(westernEaster), rollable: false,
      }),
      floatingHoliday({
        name: 'Whit Monday',
        description: 'Day after Whit Sunday (Pentecost)',
        observance: whitMonday(westernEaster), rollable: false,
      }),
      fixedHoliday({
        name: 'Bastille Day',
        description: 'Commemoration of the storming of the Bastille in 1789',
        month: 7, day: 14, rollable: true,
      }),
      fixedHoliday({
        name: 'Assumption Day',
        description: 'Commemoration of the assumption of the Virgin Mary into heaven',
        month: 8, day: 15, rollable: true,
      }),
      fixedHoliday({
        name: "All Saints' Day",
        description: 'Commemoration of all Christian saints',
        month: 11, day: 1, rollable: true,
      }),
      fixedHoliday({
        name: 'Armistice Day',
        description: 'Commemoration of the armistice ending the First World War in 1918',
        month: 11, day: 11, rollable: true,
      }),
      fixedHoliday({
        name: 'Christmas Day',
        description: 'Commemoration of the birth of Jesus Christ',
        month: 12, day: 25, rollable: true,
      }),
    ],
  });
}

export const frProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createFRCalendar(),
};
