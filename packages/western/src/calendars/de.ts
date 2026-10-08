import { fixedHoliday } from '@holiday-calendar/core';
import type { HolidayCalendar, HolidayCalendarProvider } from '@holiday-calendar/core';
import { createNoRollEasterCalendar } from './swissGermanHolidays.js';

const CODE = 'DE';
const NAME = 'Germany National Holidays';

export function createDECalendar(): HolidayCalendar {
  return createNoRollEasterCalendar(
    CODE,
    NAME,
    fixedHoliday({
      name: 'German Unity Day',
      description: 'German Unity Day',
      month: 10, day: 3, rollable: false,
    }),
  );
}

export const deProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createDECalendar(),
};
