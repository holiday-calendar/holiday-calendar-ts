import { describe, expect, it } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { fixedHoliday, floatingHoliday } from './Holiday.js';
import { makeObservance } from './function/Observance.js';
import { DateRolls } from './function/DateRolls.js';
import { HolidayCalendar } from './HolidayCalendar.js';
import { InvalidYearRangeError } from './InvalidYearRangeError.js';

// First Monday of September (US Labor Day).
const laborDayObservance = makeObservance((year) => {
  let date = Temporal.PlainDate.from({ year, month: 9, day: 1 });
  while (date.dayOfWeek !== 1) date = date.add({ days: 1 });
  return date;
});

function makeCalendar(): HolidayCalendar {
  return new HolidayCalendar({
    code: 'TEST',
    dateRoll: DateRolls.previousFridayOrFollowingMonday(),
    holidays: [
      fixedHoliday({ name: "New Year's Day", month: 1, day: 1 }),
      floatingHoliday({ name: 'Labor Day', observance: laborDayObservance }),
    ],
  });
}

function makeEmptyCalendar(): HolidayCalendar {
  return new HolidayCalendar({ code: 'EMPTY', holidays: [] });
}

describe('HolidayCalendar.calculateRange()', () => {
  it('throws InvalidYearRangeError when fromYear > toYear', () => {
    const calendar = makeCalendar();
    expect(() => calendar.calculateRange(2026, 2025)).toThrow(InvalidYearRangeError);
  });

  it('throws InvalidYearRangeError for a large inverted range', () => {
    const calendar = makeCalendar();
    expect(() => calendar.calculateRange(2055, 2025)).toThrow(InvalidYearRangeError);
  });

  it('calculateRange(y, y) equals calculate(y)', () => {
    const calendar = makeCalendar();
    expect(calendar.calculateRange(2025, 2025)).toEqual(calendar.calculate(2025));
  });

  it.each([
    [2025, 2025, 2],
    [2024, 2025, 4],
    [2020, 2024, 10],
    [2000, 2029, 60],
    [2000, 2049, 100],
  ])('calculateRange(%i, %i) returns %i entries, chronologically sorted', (from, to, count) => {
    const calendar = makeCalendar();
    const result = calendar.calculateRange(from, to);
    expect(result).toHaveLength(count);
    for (let i = 0; i < result.length - 1; i++) {
      expect(Temporal.PlainDate.compare(result[i].date, result[i + 1].date)).toBeLessThanOrEqual(0);
    }
  });

  it('calculateRange(2000, 2029) has 60 entries, sorted, first date <= 2000-01-02', () => {
    // 2000-01-01 is a Saturday, so it rolls back to 1999-12-31 under
    // previousFridayOrFollowingMonday — earlier than 2000-01-02.
    const calendar = makeCalendar();
    const result = calendar.calculateRange(2000, 2029);
    expect(result).toHaveLength(60);
    expect(
      Temporal.PlainDate.compare(result[0].date, Temporal.PlainDate.from('2000-01-02')),
    ).toBeLessThanOrEqual(0);
  });

  it('calculateRange on an empty calendar returns an empty array, not null/undefined', () => {
    const result = makeEmptyCalendar().calculateRange(2025, 2030);
    expect(result).toEqual([]);
  });

  it('rolled New Year 2023-01-02 appears in calculateRange(2023, 2023)', () => {
    // 2023-01-01 is a Sunday, rolls forward to 2023-01-02.
    const result = makeCalendar().calculateRange(2023, 2023);
    expect(result.some((r) => r.date.equals(Temporal.PlainDate.from('2023-01-02')))).toBe(true);
  });

  it('a holiday rolled into the previous nominal year still sorts correctly and is not dropped', () => {
    // 2022-01-01 is a Saturday, rolls back to 2021-12-31.
    const result = makeCalendar().calculateRange(2021, 2022);
    expect(result).toHaveLength(4);
    for (let i = 0; i < result.length - 1; i++) {
      expect(Temporal.PlainDate.compare(result[i].date, result[i + 1].date)).toBeLessThanOrEqual(0);
    }
    expect(result.some((r) => r.date.equals(Temporal.PlainDate.from('2021-12-31')))).toBe(true);
  });

  it('calculateRange(2025, 2026) matches exact expected dates and names in order', () => {
    const result = makeCalendar().calculateRange(2025, 2026);
    const expected: Array<[string, string]> = [
      ["New Year's Day", '2025-01-01'],
      ['Labor Day', '2025-09-01'],
      ["New Year's Day", '2026-01-01'],
      ['Labor Day', '2026-09-07'],
    ];
    expect(result).toHaveLength(4);
    result.forEach((entry, i) => {
      expect(entry.holiday.name).toBe(expected[i][0]);
      expect(entry.date.equals(Temporal.PlainDate.from(expected[i][1]))).toBe(true);
    });
  });
});

describe('HolidayCalendar.calculateByYear()', () => {
  it('throws InvalidYearRangeError when fromYear > toYear', () => {
    const calendar = makeCalendar();
    expect(() => calendar.calculateByYear(2026, 2025)).toThrow(InvalidYearRangeError);
  });

  it('throws InvalidYearRangeError for a large inverted range', () => {
    const calendar = makeCalendar();
    expect(() => calendar.calculateByYear(2055, 2025)).toThrow(InvalidYearRangeError);
  });

  it('calculateByYear(y, y) is a size-1 map keyed by y, value equals calculate(y)', () => {
    const calendar = makeCalendar();
    const byYear = calendar.calculateByYear(2025, 2025);
    expect(byYear.size).toBe(1);
    expect(byYear.get(2025)).toEqual(calendar.calculate(2025));
  });

  it.each([
    [2025, 2025],
    [2024, 2025],
    [2020, 2024],
    [2000, 2029],
    [2000, 2049],
  ])(
    'calculateByYear(%i, %i) map has one entry per year, ascending keys, values match calculate(year)',
    (from, to) => {
      const calendar = makeCalendar();
      const byYear = calendar.calculateByYear(from, to);
      const expectedYears = Array.from({ length: to - from + 1 }, (_, i) => from + i);
      expect(byYear.size).toBe(expectedYears.length);
      expect([...byYear.keys()]).toEqual(expectedYears);
      for (const year of expectedYears) {
        expect(byYear.get(year)).toEqual(calendar.calculate(year));
      }
    },
  );

  it('calculateByYear on an empty calendar returns a dense map of empty arrays', () => {
    const byYear = makeEmptyCalendar().calculateByYear(2025, 2030);
    expect(byYear.size).toBe(6);
    for (let year = 2025; year <= 2030; year++) {
      expect(byYear.has(year)).toBe(true);
      expect(byYear.get(year)).toEqual([]);
    }
  });

  it('rolled New Year 2023-01-02 appears in calculateByYear(2023, 2023)', () => {
    const byYear = makeCalendar().calculateByYear(2023, 2023);
    expect(byYear.get(2023)?.some((r) => r.date.equals(Temporal.PlainDate.from('2023-01-02')))).toBe(
      true,
    );
  });

  it("a cross-year-rolled holiday is grouped under its nominal year, not its rolled date's year", () => {
    // 2022-01-01 rolls to 2021-12-31, but must appear under key 2022,
    // matching calculate(2022) exactly — not silently reassigned to key 2021.
    const calendar = makeCalendar();
    const byYear = calendar.calculateByYear(2021, 2022);
    expect(byYear.get(2022)).toEqual(calendar.calculate(2022));
    expect(byYear.get(2022)?.some((r) => r.date.equals(Temporal.PlainDate.from('2021-12-31')))).toBe(
      true,
    );
  });

  it('calculateByYear keys iterate in ascending order', () => {
    const byYear = makeCalendar().calculateByYear(2000, 2010);
    const keys = [...byYear.keys()];
    const sorted = [...keys].sort((a, b) => a - b);
    expect(keys).toEqual(sorted);
  });
});
