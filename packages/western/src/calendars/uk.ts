import { HolidayCalendar, fixedHoliday, floatingHoliday, specialAnniversary, Temporal } from '@holiday-calendar/core';
import type { HolidayCalendarProvider } from '@holiday-calendar/core';
import { westernEaster } from '../observances/easter.js';
import { goodFriday } from '../observances/christian/goodFriday.js';
import { easterMonday } from '../observances/christian/easterMonday.js';
import { earlyMayBankHoliday } from '../observances/uk/earlyMayBankHoliday.js';
import { springBankHoliday } from '../observances/uk/springBankHoliday.js';
import { summerBankHoliday } from '../observances/uk/summerBankHoliday.js';

const CODE = 'UK';
const NAME = 'United Kingdom National Holidays';

/**
 * UK fixed-holiday roll: standard weekend substitution (Saturday -> +2,
 * Sunday -> +1), EXCEPT Christmas Day and Boxing Day on a Sunday roll +2
 * instead of +1 — because the adjacent sibling holiday (Boxing Day for
 * Christmas, or vice versa) already occupies the following Monday slot.
 * New Year's Day needs no special case: it follows the standard rule.
 * Branches on the RAW (pre-roll) month/day rather than holiday identity,
 * since HolidayCalendar's DateRoll signature is (date) => date with no
 * holiday-identity parameter. Only New Year's Day/Christmas Day/Boxing Day
 * are rollable:true in this calendar, so the month/day branch only ever
 * matters for those three.
 *
 * KNOWN LIMITATION: because this branches on raw date rather than holiday
 * identity, merging this calendar with another calendar that also has a
 * Jan 1 or Dec 25/26 fixed holiday (via HolidayCalendar.merge(), which
 * composes dateRolls and applies the result uniformly to the merged holiday
 * list) would apply this UK-specific override to that other holiday too.
 * Not a problem for this calendar used standalone, but relevant if a future
 * merge (e.g. with a market/settlement calendar) is added.
 */
export function ukFixedHolidayRoll(date: Temporal.PlainDate): Temporal.PlainDate {
  if (date.dayOfWeek === 6) return date.add({ days: 2 }); // Saturday -> +2
  if (date.dayOfWeek === 7) {
    const isChristmasOrBoxing = date.month === 12 && (date.day === 25 || date.day === 26);
    return date.add({ days: isChristmasOrBoxing ? 2 : 1 }); // Sunday -> +1, or +2 for Christmas/Boxing
  }
  return date;
}

export function createUKCalendar(): HolidayCalendar {
  return new HolidayCalendar({
    code: CODE,
    name: NAME,
    dateRoll: ukFixedHolidayRoll,
    weekendDays: HolidayCalendar.STANDARD_WEEKEND,
    holidays: [
      fixedHoliday({
        name: "New Year's Day",
        description: 'First day of new year in the Common Era (CE)',
        month: 1, day: 1, rollable: true,
      }),
      floatingHoliday({
        name: 'Good Friday',
        description: 'Commemoration of the crucifixion of Jesus Christ',
        observance: goodFriday(westernEaster), rollable: false,
      }),
      floatingHoliday({
        name: 'Easter Monday',
        description: 'Day after Easter Sunday',
        observance: easterMonday(westernEaster), rollable: false,
      }),
      floatingHoliday({
        name: 'Early May Bank Holiday',
        description: 'Early May bank holiday',
        observance: earlyMayBankHoliday, rollable: false,
      }),
      floatingHoliday({
        name: 'Spring Bank Holiday',
        description: 'Late May bank holiday',
        observance: springBankHoliday, rollable: false,
      }),
      specialAnniversary({
        name: 'Silver Jubilee Bank Holiday',
        description: 'Silver Jubilee of Queen Elizabeth II',
        date: Temporal.PlainDate.from({ year: 1977, month: 6, day: 7 }),
      }),
      specialAnniversary({
        name: 'Golden Jubilee Bank Holiday',
        description: 'Golden Jubilee of Queen Elizabeth II',
        date: Temporal.PlainDate.from({ year: 2002, month: 6, day: 3 }),
      }),
      specialAnniversary({
        name: 'Diamond Jubilee Bank Holiday',
        description: 'Diamond Jubilee of Queen Elizabeth II',
        date: Temporal.PlainDate.from({ year: 2012, month: 6, day: 5 }),
      }),
      specialAnniversary({
        name: 'Platinum Jubilee Bank Holiday',
        description: 'Platinum Jubilee of Queen Elizabeth II',
        date: Temporal.PlainDate.from({ year: 2022, month: 6, day: 3 }),
      }),
      floatingHoliday({
        name: 'Summer Bank Holiday',
        description: 'Summer bank holiday',
        observance: summerBankHoliday, rollable: false,
      }),
      fixedHoliday({
        name: 'Christmas Day',
        description: 'Commemoration of the birth of Jesus Christ',
        month: 12, day: 25, rollable: true,
      }),
      fixedHoliday({
        name: 'Boxing Day',
        month: 12, day: 26, rollable: true,
      }),
    ],
  });
}

export const ukProvider: HolidayCalendarProvider = {
  code: CODE,
  region: NAME,
  getCalendar: () => createUKCalendar(),
};
