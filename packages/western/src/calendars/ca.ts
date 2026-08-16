import { HolidayCalendar, fixedHoliday, floatingHoliday, DateRolls } from '@holiday-calendar/core';
import type { HolidayCalendarProvider } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { goodFriday } from '../observances/christian/goodFriday.js';
import { easterMonday } from '../observances/christian/easterMonday.js';
import { familyDay } from '../observances/ca/familyDay.js';
import { victoriaDay } from '../observances/ca/victoriaDay.js';
import { civicHoliday } from '../observances/ca/civicHoliday.js';
import { labourDay } from '../observances/ca/labourDay.js';
import { thanksgiving } from '../observances/ca/thanksgiving.js';
import { nationalDayForTruthAndReconciliation } from '../observances/ca/nationalDayForTruthAndReconciliation.js';

const CODE = 'CA';
const NAME = 'Canada National Holidays';

export function createCACalendar(): HolidayCalendar {
  return new HolidayCalendar({
    code: CODE,
    name: NAME,
    dateRoll: DateRolls.followingMonday(),
    weekendDays: HolidayCalendar.STANDARD_WEEKEND,
    holidays: [
      fixedHoliday({
        name: "New Year's Day",
        description: 'First day of new year in the Common Era (CE)',
        month: 1, day: 1, rollable: true,
      }),
      floatingHoliday({
        name: 'Family Day',
        description: 'Day to spend time with the family',
        observance: familyDay, rollable: false,
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
      floatingHoliday({
        name: 'Victoria Day',
        description: "Official celebration of birthday of Canada's Sovereign",
        observance: victoriaDay, rollable: false,
      }),
      fixedHoliday({
        name: 'Canada Day',
        description: 'Anniversary of Canadian Confederation',
        month: 7, day: 1, rollable: true,
      }),
      floatingHoliday({
        name: 'Civic Holiday',
        description: 'Civic Holiday (observed; varies by province)',
        observance: civicHoliday, rollable: false,
      }),
      floatingHoliday({
        name: 'Labour Day',
        description: 'Celebration of workers in Canada',
        observance: labourDay, rollable: false,
      }),
      floatingHoliday({
        name: 'Thanksgiving Day',
        description: 'National day for giving thanks',
        observance: thanksgiving, rollable: false,
      }),
      fixedHoliday({
        name: 'Remembrance Day',
        description: 'Commemoration of armed forces members who have died in the line of duty',
        month: 11, day: 11, rollable: true,
      }),
      floatingHoliday({
        name: 'National Day For Truth and Reconciliation',
        description: 'Recognition of the legacy of the Canadian Indian residential school system; federal statutory holiday first observed 30 September 2021',
        observance: nationalDayForTruthAndReconciliation, rollable: true,
      }),
      fixedHoliday({
        name: 'Christmas Day',
        description: 'Christmas Day',
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

export const caProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createCACalendar(),
};
