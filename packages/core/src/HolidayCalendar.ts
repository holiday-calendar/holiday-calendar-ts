import { Temporal } from '@js-temporal/polyfill';
import type { DateRoll } from './function/DateRoll.js';
import { DateRolls } from './function/DateRolls.js';
import type { Holiday } from './Holiday.js';
import { dateForYear } from './Holiday.js';
import type { HolidayDate } from './HolidayDate.js';

/**
 * ISO day-of-week numbers for Saturday (6) and Sunday (7).
 * Matches Java's HolidayCalendar.STANDARD_WEEKEND.
 */
export const STANDARD_WEEKEND: ReadonlySet<number> = new Set([6, 7]);

export interface HolidayCalendarConfig {
  readonly code: string;
  readonly name?: string;
  readonly dateRoll?: DateRoll;
  readonly weekendDays?: Iterable<number>;
  readonly holidays: Iterable<Holiday>;
}

/**
 * A named collection of holidays with date-rolling and weekend-detection logic.
 * Equivalent to Java's HolidayCalendar.
 */
export class HolidayCalendar {
  static readonly STANDARD_WEEKEND: ReadonlySet<number> = STANDARD_WEEKEND;

  readonly code: string;
  readonly name: string;
  readonly dateRoll: DateRoll;
  readonly weekendDays: ReadonlySet<number>;
  readonly holidays: ReadonlyArray<Holiday>;

  constructor(config: HolidayCalendarConfig) {
    this.code = config.code;
    this.name = config.name ?? config.code;
    this.dateRoll = config.dateRoll ?? DateRolls.noRoll();
    this.weekendDays = new Set(config.weekendDays ?? STANDARD_WEEKEND);
    this.holidays = Array.from(config.holidays);
  }

  /**
   * Calculates all holidays for the given year, applying date rolling where
   * the holiday is rollable. Returns results sorted chronologically.
   */
  calculate(year: number): HolidayDate[] {
    const results: HolidayDate[] = [];
    for (const holiday of this.holidays) {
      const raw = dateForYear(holiday, year);
      if (raw === null) continue;
      const rollable = 'rollable' in holiday && holiday.rollable;
      const date = rollable ? this.dateRoll(raw) : raw;
      results.push({ holiday, date });
    }
    return results.sort((a, b) => Temporal.PlainDate.compare(a.date, b.date));
  }

  /**
   * Returns a new HolidayCalendar with the union of holidays from both calendars,
   * preserving this calendar's code, name, dateRoll, and weekendDays.
   */
  merge(other: HolidayCalendar): HolidayCalendar {
    return new HolidayCalendar({
      code: this.code,
      name: this.name,
      dateRoll: this.dateRoll,
      weekendDays: this.weekendDays,
      holidays: [...this.holidays, ...other.holidays],
    });
  }

  /** Returns true if the given date falls on a configured weekend day. */
  isWeekend(date: Temporal.PlainDate): boolean {
    return this.weekendDays.has(date.dayOfWeek);
  }
}
