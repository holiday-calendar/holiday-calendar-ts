import { Temporal } from '@js-temporal/polyfill';
import type { Observance } from './function/Observance.js';

/**
 * A fixed holiday that falls on the same month and day every year (e.g. Christmas).
 * Equivalent to Java's FixedHoliday.
 */
export interface FixedHoliday {
  readonly type: 'fixed';
  readonly name: string;
  readonly description?: string;
  readonly month: number; // 1–12
  readonly day: number;   // 1–31
  readonly rollable: boolean;
}

/**
 * A floating holiday whose date is computed by an Observance function each year (e.g. Easter).
 * Equivalent to Java's FloatingHoliday.
 */
export interface FloatingHoliday {
  readonly type: 'floating';
  readonly name: string;
  readonly description?: string;
  readonly observance: Observance;
  readonly rollable: boolean;
}

/**
 * A one-time commemorative holiday tied to a specific date (e.g. a jubilee).
 * Only observed in the year matching the date's year.
 * Equivalent to Java's SpecialAnniversary.
 */
export interface SpecialAnniversary {
  readonly type: 'anniversary';
  readonly name: string;
  readonly description?: string;
  readonly date: Temporal.PlainDate;
  readonly rollable: boolean;
}

/**
 * A day the exchange stays open but closes early (e.g. day after
 * Thanksgiving, Christmas Eve). Never weekend-rolled — there is no
 * `rollable` field. closeTime/timeZoneId are always the exchange's own
 * local time; never normalize to UTC.
 * Equivalent to Java's EarlyCloseHoliday.
 */
export interface EarlyCloseHoliday {
  readonly type: 'earlyClose';
  readonly name: string;
  readonly description?: string;
  readonly observance: Observance;
  readonly closeTime: Temporal.PlainTime;
  readonly timeZoneId: string; // IANA zone id, e.g. "America/New_York"
}

/**
 * A discriminated union of all holiday types: FixedHoliday, FloatingHoliday,
 * SpecialAnniversary, and EarlyCloseHoliday.
 * Equivalent to Java's sealed Holiday interface.
 */
export type Holiday = FixedHoliday | FloatingHoliday | SpecialAnniversary | EarlyCloseHoliday;

/** Creates a FixedHoliday. Defaults rollable to true. */
export function fixedHoliday(opts: {
  name: string;
  description?: string;
  month: number;
  day: number;
  rollable?: boolean;
}): FixedHoliday {
  const { rollable = true, ...rest } = opts;
  return { type: 'fixed', rollable, ...rest };
}

/** Creates a FloatingHoliday. Defaults rollable to true. */
export function floatingHoliday(opts: {
  name: string;
  description?: string;
  observance: Observance;
  rollable?: boolean;
}): FloatingHoliday {
  const { rollable = true, ...rest } = opts;
  return { type: 'floating', rollable, ...rest };
}

/** Creates a SpecialAnniversary. Defaults rollable to false. */
export function specialAnniversary(opts: {
  name: string;
  description?: string;
  date: Temporal.PlainDate;
  rollable?: boolean;
}): SpecialAnniversary {
  const { rollable = false, ...rest } = opts;
  return { type: 'anniversary', rollable, ...rest };
}

/** Creates an EarlyCloseHoliday. There is no `rollable` option — early closes are never weekend-rolled. */
export function earlyCloseHoliday(opts: {
  name: string;
  description?: string;
  observance: Observance;
  closeTime: Temporal.PlainTime;
  timeZoneId: string;
}): EarlyCloseHoliday {
  return { type: 'earlyClose', ...opts };
}

/**
 * Returns the date of a holiday for the given year, or null if it does not
 * occur that year. Does not apply any DateRoll — that is HolidayCalendar's job.
 */
export function dateForYear(holiday: Holiday, year: number): Temporal.PlainDate | null {
  switch (holiday.type) {
    case 'fixed':
      return Temporal.PlainDate.from({ year, month: holiday.month, day: holiday.day });
    case 'floating':
      return holiday.observance(year);
    case 'anniversary':
      return holiday.date.year === year ? holiday.date : null;
    case 'earlyClose':
      return holiday.observance(year);
  }
}
