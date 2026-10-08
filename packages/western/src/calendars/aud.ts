import { HolidayCalendar, floatingHoliday } from '@holiday-calendar/core';
import type { HolidayCalendarProvider } from '@holiday-calendar/core';
import { nswBankHoliday } from '../observances/au/bankHoliday.js';
import { auFixedHolidayRoll } from './au.js';
import {
  auNewYearsDay, auAustraliaDay, auGoodFriday, auEasterMonday,
  auAnzacDay, auKingsBirthday, auChristmasDay, auBoxingDay,
} from './auHolidays.js';

const CODE = 'AUD';
const NAME = 'Australia (RBA) Holidays';

const bankHoliday = floatingHoliday({
  name: 'Bank Holiday',
  description: 'NSW Bank Holiday (1st Monday in August)',
  observance: nswBankHoliday, rollable: false,
});

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
 * Shared holiday definitions (and their descriptions, which carry AU's
 * state-variance notes rather than Java's terser AUD text) live in
 * `auHolidays.ts`.
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
      auNewYearsDay,
      auAustraliaDay,
      auGoodFriday,
      auEasterMonday,
      auAnzacDay,
      auKingsBirthday,
      bankHoliday,
      auChristmasDay,
      auBoxingDay,
    ],
  });
}

export const audProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createAUDCalendar(),
};
