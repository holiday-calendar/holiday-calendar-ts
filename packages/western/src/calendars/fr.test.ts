import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import type { HolidayDate } from '@holiday-calendar/core';
import { createFRCalendar, frProvider } from './fr.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

const nameOn = (dates: HolidayDate[], iso: string): string | undefined =>
  dates.find((hd) => hd.date.equals(d(iso)))?.holiday.name;

describe('FR calendar — basic wiring', () => {
  const calendar = createFRCalendar();

  it('has exactly 11 configured holidays', () => {
    expect(calendar.holidays).toHaveLength(11);
  });

  it('code/name/provider are wired correctly', () => {
    expect(calendar.code).toBe('FR');
    expect(calendar.name).toBe('France National Holidays');
    expect(frProvider.code).toBe('FR');
    expect(frProvider.getCalendar().code).toBe('FR');
  });
});

describe('FR calendar — exact holiday set (2026)', () => {
  const calendar = createFRCalendar();

  it('matches all 11 [name, date] pairs in chronological order', () => {
    const result = calendar.calculate(2026);
    const expected: Array<[string, string]> = [
      ["New Year's Day", '2026-01-01'],
      ['Easter Monday', '2026-04-06'],
      ['Labour Day', '2026-05-01'],
      ['Victory in Europe Day', '2026-05-08'],
      ['Ascension Day', '2026-05-14'],
      ['Whit Monday', '2026-05-25'],
      ['Bastille Day', '2026-07-14'],
      ['Assumption Day', '2026-08-15'], // Sat, no roll
      ["All Saints' Day", '2026-11-01'], // Sun, no roll
      ['Armistice Day', '2026-11-11'],
      ['Christmas Day', '2026-12-25'],
    ];
    expect(result).toHaveLength(11);
    expected.forEach(([name, iso], i) => {
      expect(result[i]?.holiday.name).toBe(name);
      expect(result[i]?.date.equals(d(iso))).toBe(true);
    });
  });
});

describe('FR calendar — no weekend roll (France grants no substitute holiday)', () => {
  const calendar = createFRCalendar();

  // France provides no statutory compensation when a public holiday falls on
  // a weekly rest day, so every fixed holiday stays on its calendar date,
  // Saturday or Sunday included.
  it.each([
    [2028, "New Year's Day", '2028-01-01'], // Sat
    [2027, 'Labour Day', '2027-05-01'], // Sat
    [2027, 'Victory in Europe Day', '2027-05-08'], // Sat
    [2024, 'Bastille Day', '2024-07-14'], // Sun
    [2026, 'Assumption Day', '2026-08-15'], // Sat
    [2027, 'Assumption Day', '2027-08-15'], // Sun
    [2025, "All Saints' Day", '2025-11-01'], // Sat
    [2026, "All Saints' Day", '2026-11-01'], // Sun
    [2028, 'Armistice Day', '2028-11-11'], // Sat
    [2027, 'Christmas Day', '2027-12-25'], // Sat
  ])('%i %s stays on %s', (year, name, iso) => {
    expect(nameOn(calendar.calculate(year), iso)).toBe(name);
    expect(d(iso).dayOfWeek).toBeGreaterThanOrEqual(6);
  });

  it('never returns a fixed holiday on a different date than its calendar date, 2024-2028', () => {
    const fixed: Array<[string, number, number]> = [
      ["New Year's Day", 1, 1], ['Labour Day', 5, 1], ['Victory in Europe Day', 5, 8],
      ['Bastille Day', 7, 14], ['Assumption Day', 8, 15], ["All Saints' Day", 11, 1],
      ['Armistice Day', 11, 11], ['Christmas Day', 12, 25],
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

describe('FR calendar — scope boundary (no Good Friday)', () => {
  const calendar = createFRCalendar();

  it('never includes Good Friday (not a French national holiday; present in UK/CA/US but out of scope for FR)', () => {
    const names = calendar.calculate(2026).map((hd) => hd.holiday.name);
    expect(names).not.toContain('Good Friday');
  });
});

describe('FR calendar — multi-year integration (2024-2028)', () => {
  const calendar = createFRCalendar();

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

  it.each([2024, 2025, 2026, 2027, 2028])('returns exactly 11 holidays for %i', (year) => {
    expect(calendar.calculate(year)).toHaveLength(11);
  });
});
