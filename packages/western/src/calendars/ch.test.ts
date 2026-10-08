import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import type { HolidayDate } from '@holiday-calendar/core';
import { createCHCalendar, chProvider } from './ch.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

const nameOn = (dates: HolidayDate[], iso: string): string | undefined =>
  dates.find((hd) => hd.date.equals(d(iso)))?.holiday.name;

describe('CH calendar — basic wiring', () => {
  const calendar = createCHCalendar();

  it('has exactly 9 configured holidays', () => {
    expect(calendar.holidays).toHaveLength(9);
  });

  it('code/name/provider are wired correctly', () => {
    expect(calendar.code).toBe('CH');
    expect(calendar.name).toBe('Switzerland National Holidays');
    expect(chProvider.code).toBe('CH');
    expect(chProvider.getCalendar().code).toBe('CH');
  });
});

describe('CH calendar — exact holiday set, non-roll-heavy year (2024)', () => {
  const calendar = createCHCalendar();

  it('matches all 9 [name, date] pairs in chronological order', () => {
    const result = calendar.calculate(2024);
    const expected: Array<[string, string]> = [
      ["New Year's Day", '2024-01-01'],
      ['Good Friday', '2024-03-29'],
      ['Easter Monday', '2024-04-01'],
      ['Labour Day', '2024-05-01'],
      ['Ascension Day', '2024-05-09'],
      ['Whit Monday', '2024-05-20'],
      ['Swiss National Day', '2024-08-01'],
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

describe('CH calendar — no weekend roll (Switzerland grants no federal substitute holiday)', () => {
  const calendar = createCHCalendar();

  // Switzerland provides no federal substitute day when a public holiday
  // falls on a weekend, so every fixed holiday stays on its calendar date,
  // Saturday or Sunday included.
  it.each([
    [2022, "New Year's Day", '2022-01-01'], // Sat
    [2021, 'Labour Day', '2021-05-01'], // Sat
    [2027, 'Labour Day', '2027-05-01'], // Sat
    [2021, 'Swiss National Day', '2021-08-01'], // Sun
    [2027, 'Swiss National Day', '2027-08-01'], // Sun
    [2021, 'Christmas Day', '2021-12-25'], // Sat
    [2027, 'Christmas Day', '2027-12-25'], // Sat
    [2022, 'Christmas Day', '2022-12-25'], // Sun
    [2021, 'Boxing Day', '2021-12-26'], // Sun
    [2026, 'Boxing Day', '2026-12-26'], // Sat
  ])('%i %s stays on %s', (year, name, iso) => {
    expect(nameOn(calendar.calculate(year), iso)).toBe(name);
    expect(d(iso).dayOfWeek).toBeGreaterThanOrEqual(6);
  });

  const fixed: Array<[string, number, number]> = [
    ["New Year's Day", 1, 1], ['Labour Day', 5, 1], ['Swiss National Day', 8, 1],
    ['Christmas Day', 12, 25], ['Boxing Day', 12, 26],
  ];
  const years = [2024, 2025, 2026, 2027, 2028];

  it.each(years.flatMap((year) => fixed.map(([name, month, day]) => [year, name, month, day] as const)))(
    '%i %s stays on its calendar date',
    (year, name, month, day) => {
      const hd = calendar.calculate(year).find((r) => r.holiday.name === name);
      expect(hd?.date.toString()).toBe(Temporal.PlainDate.from({ year, month, day }).toString());
    },
  );
});

describe('CH calendar — scope boundary (no Assumption Day / Bastille Day)', () => {
  const calendar = createCHCalendar();

  it('never includes Assumption Day (cantonal-only in Switzerland, not part of this national default set; present in FR)', () => {
    const names = calendar.calculate(2026).map((hd) => hd.holiday.name);
    expect(names).not.toContain('Assumption Day');
  });

  it('never includes Bastille Day (French national holiday, out of scope for CH)', () => {
    const names = calendar.calculate(2026).map((hd) => hd.holiday.name);
    expect(names).not.toContain('Bastille Day');
  });
});

describe('CH calendar — multi-year integration (2024-2028)', () => {
  const calendar = createCHCalendar();

  it('has no two holidays sharing a resolved date across 2024-2028', () => {
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
