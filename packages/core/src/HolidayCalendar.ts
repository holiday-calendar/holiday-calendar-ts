import { Temporal } from '@js-temporal/polyfill';
import type { DateRoll } from './function/DateRoll.js';
import { DateRolls } from './function/DateRolls.js';
import type { Holiday } from './Holiday.js';
import { dateForYear } from './Holiday.js';
import type { HolidayDate } from './HolidayDate.js';
import { InvalidYearRangeError } from './InvalidYearRangeError.js';

/**
 * ISO day-of-week numbers for Saturday (6) and Sunday (7).
 * Matches Java's HolidayCalendar.STANDARD_WEEKEND.
 */
export const STANDARD_WEEKEND: ReadonlySet<number> = new Set([6, 7]);

const isEarlyClose = (holiday: Holiday): boolean => holiday.type === 'earlyClose';

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

  private resolve(year: number, include: (holiday: Holiday) => boolean): HolidayDate[] {
    const results: HolidayDate[] = [];
    for (const holiday of this.holidays) {
      if (!include(holiday)) continue;
      const raw = dateForYear(holiday, year);
      if (raw === null) continue;
      // EarlyCloseHoliday is never rollable — checked explicitly, not just
      // by the type declaration omitting the field, so a stray runtime
      // `rollable` key on an earlyClose object is never honored.
      const rollable = holiday.type !== 'earlyClose' && holiday.rollable;
      const date = rollable ? this.dateRoll(raw) : raw;
      results.push({ holiday, date });
    }
    return results.sort((a, b) => Temporal.PlainDate.compare(a.date, b.date));
  }

  /**
   * Calculates all full-closure holidays for the given year, applying date
   * rolling where the holiday is rollable. EarlyCloseHoliday entries are
   * excluded — see calculateEarlyCloses(). Returns results sorted
   * chronologically.
   */
  calculate(year: number): HolidayDate[] {
    return this.resolve(year, (holiday) => !isEarlyClose(holiday));
  }

  /**
   * Calculates only the early-close holidays for the given year. Never
   * date-rolled — early closes are never weekend-rolled, full stop.
   *
   * If an early close's resolved date collides with a full-closure holiday's
   * resolved date (from calculate()) in the same year, the early close is
   * suppressed from this result — a full closure is the stronger signal that
   * the whole day is non-trading, so reporting both would give a client
   * contradictory information about the same date (e.g. when merging two
   * independently-authored market calendars). See BUILD_SPEC.md §8.5 (issue
   * #35) for full rationale.
   *
   * Does not guard against an early close landing on a configured weekendDay
   * — verified at parity with Java, which doesn't either; region packages own
   * that data correctness.
   *
   * Returns results sorted chronologically.
   */
  calculateEarlyCloses(year: number): HolidayDate[] {
    const closureDates = new Set(this.calculate(year).map((hd) => hd.date.toString()));
    return this.resolve(year, isEarlyClose).filter((hd) => !closureDates.has(hd.date.toString()));
  }

  /**
   * Returns true if this calendar defines any early-close holiday. Cheap and
   * year-independent — does not resolve any observance dates.
   */
  hasEarlyCloses(): boolean {
    return this.holidays.some(isEarlyClose);
  }

  private static validateRange(fromYear: number, toYear: number): void {
    if (fromYear > toYear) {
      throw new InvalidYearRangeError(fromYear, toYear);
    }
  }

  /**
   * Calculates all full-closure holidays across the inclusive year range
   * [fromYear, toYear], flattened into a single chronologically sorted list.
   * EarlyCloseHoliday entries are excluded, same as calculate(). Throws
   * InvalidYearRangeError if fromYear > toYear.
   */
  calculateRange(fromYear: number, toYear: number): HolidayDate[] {
    HolidayCalendar.validateRange(fromYear, toYear);
    const results: HolidayDate[] = [];
    for (let year = fromYear; year <= toYear; year++) {
      results.push(...this.calculate(year));
    }
    return results.sort((a, b) => Temporal.PlainDate.compare(a.date, b.date));
  }

  /**
   * Calculates all full-closure holidays across the inclusive year range
   * [fromYear, toYear], grouped by nominal year. EarlyCloseHoliday entries
   * are excluded, same as calculate(). Every year in the range is present as
   * a key, even when its holiday list is empty. Throws InvalidYearRangeError
   * if fromYear > toYear.
   */
  calculateByYear(fromYear: number, toYear: number): Map<number, HolidayDate[]> {
    HolidayCalendar.validateRange(fromYear, toYear);
    const results = new Map<number, HolidayDate[]>();
    for (let year = fromYear; year <= toYear; year++) {
      results.set(year, this.calculate(year));
    }
    return results;
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
