import { fixedHoliday, floatingHoliday, relativeObservance } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { goodFriday } from '../observances/christian/goodFriday.js';
import { easterMonday } from '../observances/christian/easterMonday.js';
import { kingsBirthday } from '../observances/au/kingsBirthday.js';

/**
 * Holiday definitions shared by the national `AU` calendar and the `AUD`
 * (RBA) settlement calendar, mirroring Java's `AuHolidays.baseHolidays()`.
 * Both calendars use the same `auFixedHolidayRoll` (see au.ts); only the
 * holiday set differs (see au.ts and aud.ts). The AU descriptions
 * (including the state-variance notes) are used for both calendars.
 */
export const auNewYearsDay = fixedHoliday({
  name: "New Year's Day",
  description: 'First day of new year in the Common Era (CE)',
  month: 1, day: 1, rollable: true,
});

export const auAustraliaDay = fixedHoliday({
  name: 'Australia Day',
  description: 'Commemoration of the 1788 arrival of the First Fleet at Port Jackson',
  month: 1, day: 26, rollable: true,
});

export const auGoodFriday = floatingHoliday({
  name: 'Good Friday',
  description: 'Friday before Easter Sunday',
  observance: goodFriday(westernEaster), rollable: false,
});

/** In `AU` only; not observed by `AUD`. */
export const auEasterSaturday = floatingHoliday({
  name: 'Easter Saturday',
  description: 'Day after Good Friday; not observed in Western Australia or Tasmania',
  observance: relativeObservance(goodFriday(westernEaster), 1), rollable: false,
});

export const auEasterMonday = floatingHoliday({
  name: 'Easter Monday',
  description: 'Monday after Easter Sunday',
  observance: easterMonday(westernEaster), rollable: false,
});

export const auAnzacDay = fixedHoliday({
  name: 'ANZAC Day',
  description: 'Commemoration of the Australian and New Zealand Army Corps; whether a weekend substitute is observed varies by state/territory',
  month: 4, day: 25, rollable: true,
});

export const auKingsBirthday = floatingHoliday({
  name: "King's Birthday",
  description: "King's Birthday (2nd Monday in June); Queensland uses the 1st Monday in October and Western Australia uses a late-September date",
  observance: kingsBirthday, rollable: false,
});

export const auChristmasDay = fixedHoliday({
  name: 'Christmas Day',
  description: 'Celebration of traditional Christmas holiday',
  month: 12, day: 25, rollable: true,
});

export const auBoxingDay = fixedHoliday({
  name: 'Boxing Day',
  description: 'Day after Christmas',
  month: 12, day: 26, rollable: true,
});
