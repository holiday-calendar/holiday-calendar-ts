import { HolidayCalendar, fixedHoliday, floatingHoliday } from '@holiday-calendar/core';
import type { HolidayCalendarProvider } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { goodFriday } from '../observances/christian/goodFriday.js';
import { easterMonday } from '../observances/christian/easterMonday.js';
import { kingsBirthday } from '../observances/au/kingsBirthday.js';
import { nswBankHoliday } from '../observances/au/bankHoliday.js';
import { auFixedHolidayRoll } from './au.js';

const CODE = 'AUD';
const NAME = 'Australia (RBA) Holidays';

/**
 * Australia (RBA) settlement holiday calendar — a central-bank/settlement
 * calendar under an ISO 4217 code, kept separate from the national `AU`
 * calendar. Same as `AU` minus Easter Saturday, plus the NSW Bank Holiday
 * (1st Monday in August; the RBA settles in Sydney). Java documents no RBA
 * primary source for that inclusion — it is a defensible modeling choice.
 *
 * DELIBERATE DEVIATION FROM JAVA: upstream Java v2.1.0 uses
 * `DateRolls.previousFridayOrFollowingMonday()` here, which moves a Saturday
 * holiday BACK to Friday. That does not match RBA practice: the RBA's own
 * Public & Bank Holidays page for 2026 lists Boxing Day (Sat 26 Dec) as
 * "Boxing Day Observed" on Mon 28 Dec, whereas the Java roll would put it
 * on Fri 25 Dec (colliding with Christmas) and leave Dec 28 open. This
 * calendar therefore reuses AU's forward-substitution `auFixedHolidayRoll`.
 * Dates differ from Java for Saturday holidays (e.g. Christmas 2021:
 * Java Fri Dec 24, here Mon Dec 27). See `docs/calendars/AUD.md`.
 *
 * Because DateRoll has no holiday-identity parameter, `auFixedHolidayRoll`'s
 * Christmas/Boxing Day Sunday special case keys off the raw month/day;
 * merging this calendar with another carrying those dates would compose
 * rolls — settlement calendars are not meant to be merged with national ones.
 *
 * `calculate()` does not dedupe, so ANZAC Day and Easter Monday both appear
 * on one date in years they coincide (2038-04-26 after rolling).
 */
export function createAUDCalendar(): HolidayCalendar {
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
        description: 'Australia Day',
        month: 1, day: 26, rollable: true,
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
        name: 'ANZAC Day',
        description: 'ANZAC Day',
        month: 4, day: 25, rollable: true,
      }),
      floatingHoliday({
        name: "King's Birthday",
        description: "King's Birthday (RBA; 2nd Monday in June)",
        observance: kingsBirthday, rollable: false,
      }),
      floatingHoliday({
        name: 'Bank Holiday',
        description: 'NSW Bank Holiday (1st Monday in August)',
        observance: nswBankHoliday, rollable: false,
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

export const audProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createAUDCalendar(),
};
