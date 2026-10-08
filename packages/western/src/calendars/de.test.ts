import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import type { HolidayDate } from '@holiday-calendar/core';
import { createDECalendar, deProvider } from './de.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

const namesOn = (dates: HolidayDate[], iso: string): string[] =>
  dates.filter((hd) => hd.date.equals(d(iso))).map((hd) => hd.holiday.name);

const nameOn = (dates: HolidayDate[], iso: string): string | undefined => namesOn(dates, iso)[0];

describe('DE calendar — basic wiring', () => {
  const calendar = createDECalendar();

  it('has exactly 9 configured holidays', () => {
    expect(calendar.holidays).toHaveLength(9);
  });

  it('code/name/provider are wired correctly', () => {
    expect(calendar.code).toBe('DE');
    expect(calendar.name).toBe('Germany National Holidays');
    expect(deProvider.code).toBe('DE');
    expect(deProvider.getCalendar().code).toBe('DE');
  });
});

describe('DE calendar — exact holiday set (2024)', () => {
  const calendar = createDECalendar();

  it('matches all 9 [name, date] pairs in chronological order', () => {
    const result = calendar.calculate(2024);
    const expected: Array<[string, string]> = [
      ["New Year's Day", '2024-01-01'],
      ['Good Friday', '2024-03-29'],
      ['Easter Monday', '2024-04-01'],
      ['Labour Day', '2024-05-01'],
      ['Ascension Day', '2024-05-09'],
      ['Whit Monday', '2024-05-20'],
      ['German Unity Day', '2024-10-03'],
      ['Christmas Day', '2024-12-25'],
      ['Boxing Day', '2024-12-26'],
    ];
    expect(result).toHaveLength(9);
    expected.forEach(([name, iso], i) => {
      expect(result[i]?.holiday.name).toBe(name);
      expect(result[i]?.date.equals(d(iso))).toBe(true);
    });
  });
});

describe('DE calendar — no weekend roll (Germany grants no substitute holiday)', () => {
  const calendar = createDECalendar();

  // Germany observes no substitute day when a public holiday falls on a
  // weekend, so every fixed holiday stays on its calendar date, Saturday or
  // Sunday included.
  it.each([
    [2028, "New Year's Day", '2028-01-01'], // Sat
    [2027, 'Labour Day', '2027-05-01'], // Sat
    [2021, 'German Unity Day', '2021-10-03'], // Sun, no Monday-in-lieu
    [2026, 'German Unity Day', '2026-10-03'], // Sat
    [2027, 'German Unity Day', '2027-10-03'], // Sun
    [2027, 'Christmas Day', '2027-12-25'], // Sat
    [2027, 'Boxing Day', '2027-12-26'], // Sun
  ])('%i %s stays on %s', (year, name, iso) => {
    expect(nameOn(calendar.calculate(year), iso)).toBe(name);
    expect(d(iso).dayOfWeek).toBeGreaterThanOrEqual(6);
  });

  it('keeps Christmas Day and Boxing Day on separate dates in 2026 (Dec 26 is a Saturday)', () => {
    const dates2026 = calendar.calculate(2026);
    expect(namesOn(dates2026, '2026-12-25')).toEqual(['Christmas Day']);
    expect(namesOn(dates2026, '2026-12-26')).toEqual(['Boxing Day']);
  });

  it('never returns a fixed holiday on a different date than its calendar date, 2024-2028', () => {
    const fixed: Array<[string, number, number]> = [
      ["New Year's Day", 1, 1], ['Labour Day', 5, 1], ['German Unity Day', 10, 3],
      ['Christmas Day', 12, 25], ['Boxing Day', 12, 26],
    ];
    for (let year = 2024; year <= 2028; year++) {
      const result = calendar.calculate(year);
      for (const [name, month, day] of fixed) {
        const hd = result.find((r) => r.holiday.name === name);
        expect(hd?.date.equals(Temporal.PlainDate.from({ year, month, day }))).toBe(true);
      }
    }
  });
});

describe('DE calendar — scope boundary (no Xetra-only market closures)', () => {
  const calendar = createDECalendar();

  it('never includes Christmas Eve or New Year\'s Eve (Xetra/XETR market-only closures, not German national holidays)', () => {
    const names = calendar.calculate(2026).map((hd) => hd.holiday.name);
    expect(names).not.toContain('Christmas Eve');
    expect(names).not.toContain("New Year's Eve");
  });
});

describe('DE calendar — multi-year integration (2024-2028)', () => {
  const calendar = createDECalendar();

  it('has no two holidays sharing a resolved date', () => {
    for (let year = 2024; year <= 2028; year++) {
      const dates = calendar.calculate(year).map((hd) => hd.date.toString());
      expect(new Set(dates).size).toBe(dates.length);
    }
  });

  it('sorts calculate() output chronologically regardless of registration order', () => {
    for (let year = 2024; year <= 2028; year++) {
      const results = calendar.calculate(year);
      for (let i = 1; i < results.length; i++) {
        expect(Temporal.PlainDate.compare(results[i - 1]!.date, results[i]!.date)).toBeLessThanOrEqual(0);
      }
    }
  });

  it.each([2024, 2025, 2026, 2027, 2028])('returns exactly 9 holidays for %i', (year) => {
    expect(calendar.calculate(year)).toHaveLength(9);
  });
});
