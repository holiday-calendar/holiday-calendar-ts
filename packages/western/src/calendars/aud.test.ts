import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import type { HolidayDate } from '@holiday-calendar/core';
import { createAUDCalendar, audProvider } from './aud.js';
import { createAUCalendar } from './au.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

const namesOn = (dates: HolidayDate[], iso: string): string[] =>
  dates.filter((hd) => hd.date.equals(d(iso))).map((hd) => hd.holiday.name);

const nameOn = (dates: HolidayDate[], iso: string): string | undefined => namesOn(dates, iso)[0];

const dateOf = (dates: HolidayDate[], name: string): string | undefined =>
  dates.find((hd) => hd.holiday.name === name)?.date.toString();

describe('AUD calendar — basic wiring', () => {
  const calendar = createAUDCalendar();

  it('has exactly 9 configured holidays and no Easter Saturday', () => {
    expect(calendar.holidays).toHaveLength(9);
    expect(calendar.holidays.map((h) => h.name)).not.toContain('Easter Saturday');
  });

  it('code/name/provider are wired correctly', () => {
    expect(calendar.code).toBe('AUD');
    expect(calendar.name).toBe('Australia (RBA) Holidays');
    expect(audProvider.code).toBe('AUD');
    expect(audProvider.getCalendar().code).toBe('AUD');
  });

  it('marks only weekday-anchored holidays as non-rollable', () => {
    const nonRollable = calendar.holidays
      .filter((h) => 'rollable' in h && !h.rollable)
      .map((h) => h.name);
    expect(nonRollable).toEqual(['Good Friday', 'Easter Monday', "King's Birthday", 'Bank Holiday']);
  });
});

describe('AUD calendar — exact holiday set, non-roll-heavy year (2024)', () => {
  it('matches all 9 [name, date] pairs in chronological order', () => {
    const result = createAUDCalendar().calculate(2024);
    const expected: Array<[string, string]> = [
      ["New Year's Day", '2024-01-01'],
      ['Australia Day', '2024-01-26'],
      ['Good Friday', '2024-03-29'],
      ['Easter Monday', '2024-04-01'],
      ['ANZAC Day', '2024-04-25'],
      ["King's Birthday", '2024-06-10'],
      ['Bank Holiday', '2024-08-05'],
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

describe('AUD calendar — forward weekend substitution (deliberate deviation from Java)', () => {
  const calendar = createAUDCalendar();

  it.each([
    // RBA Public & Bank Holidays 2026: Boxing Day (Sat) observed Mon 28 Dec
    [2026, 'Boxing Day', '2026-12-28'],
    [2026, 'Christmas Day', '2026-12-25'],
    // Java would give Fri 24 Dec; forward rule gives Mon 27 Dec
    [2021, 'Christmas Day', '2021-12-27'],
    [2021, 'Boxing Day', '2021-12-28'],
    // Sunday Christmas rolls +2 so it doesn't collide with Boxing Day
    [2022, 'Christmas Day', '2022-12-27'],
    [2022, 'Boxing Day', '2022-12-26'],
    [2020, 'Australia Day', '2020-01-27'],
    [2023, 'Australia Day', '2023-01-26'],
    [2027, 'ANZAC Day', '2027-04-26'],
  ])('%i %s resolves to %s', (year, name, iso) => {
    expect(dateOf(calendar.calculate(year), name)).toBe(iso);
  });

  it("rolls Saturday New Year's Day 2028 forward within the same year", () => {
    expect(nameOn(calendar.calculate(2028), '2028-01-03')).toBe("New Year's Day");
  });
});

describe('AUD calendar — Easter Monday / ANZAC Day coincidence (no dedupe)', () => {
  const calendar = createAUDCalendar();

  it.each([
    [2011, '2011-04-25'],
    [2038, '2038-04-26'],
  ])('%i has both on %s', (year, iso) => {
    const result = calendar.calculate(year);
    expect(result).toHaveLength(9);
    expect(namesOn(result, iso).sort()).toEqual(['ANZAC Day', 'Easter Monday']);
  });
});

describe('AUD calendar — differences from AU', () => {
  const aud = createAUDCalendar();
  const au = createAUCalendar();

  it('omits Easter Saturday and adds the NSW Bank Holiday', () => {
    const audNames = aud.calculate(2024).map((hd) => hd.holiday.name);
    const auNames = au.calculate(2024).map((hd) => hd.holiday.name);
    expect(auNames).toContain('Easter Saturday');
    expect(audNames).not.toContain('Easter Saturday');
    expect(audNames).toContain('Bank Holiday');
    expect(auNames).not.toContain('Bank Holiday');
  });

  it('shares AU weekend-roll results for shared holidays', () => {
    for (const year of [2021, 2022, 2026, 2027, 2028]) {
      for (const name of ["New Year's Day", 'Australia Day', 'ANZAC Day', 'Christmas Day', 'Boxing Day']) {
        expect(dateOf(aud.calculate(year), name)).toBe(dateOf(au.calculate(year), name));
      }
    }
  });
});

describe('AUD calendar — multi-year invariants (2000-2030)', () => {
  const calendar = createAUDCalendar();

  it('returns 9 chronologically sorted entries per year, with Bank Holiday on a Monday in Aug 1-7', () => {
    for (let year = 2000; year <= 2030; year++) {
      const result = calendar.calculate(year);
      expect(result).toHaveLength(9);
      for (let i = 1; i < result.length; i++) {
        expect(Temporal.PlainDate.compare(result[i - 1]!.date, result[i]!.date)).toBeLessThanOrEqual(0);
      }
      const bank = result.find((hd) => hd.holiday.name === 'Bank Holiday')!.date;
      expect(bank.dayOfWeek).toBe(1);
      expect(bank.month).toBe(8);
      expect(bank.day).toBeLessThanOrEqual(7);
    }
  });
});
