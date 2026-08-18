import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import type { HolidayDate } from '@holiday-calendar/core';
import { createAUCalendar, auProvider } from './au.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

const namesOn = (dates: HolidayDate[], iso: string): string[] =>
  dates.filter((hd) => hd.date.equals(d(iso))).map((hd) => hd.holiday.name);

const nameOn = (dates: HolidayDate[], iso: string): string | undefined => namesOn(dates, iso)[0];

describe('AU calendar — basic wiring', () => {
  const calendar = createAUCalendar();

  it('has exactly 9 configured holidays', () => {
    expect(calendar.holidays).toHaveLength(9);
  });

  it('code/name/provider are wired correctly', () => {
    expect(calendar.code).toBe('AU');
    expect(calendar.name).toBe('Australia National Holidays');
    expect(auProvider.code).toBe('AU');
    expect(auProvider.getCalendar().code).toBe('AU');
  });
});

describe('AU calendar — exact holiday set, non-roll-heavy year (2024)', () => {
  const calendar = createAUCalendar();

  it('matches all 9 [name, date] pairs in chronological order', () => {
    const result = calendar.calculate(2024);
    const expected: Array<[string, string]> = [
      ["New Year's Day", '2024-01-01'],
      ['Australia Day', '2024-01-26'],
      ['Good Friday', '2024-03-29'],
      ['Easter Saturday', '2024-03-30'],
      ['Easter Monday', '2024-04-01'],
      ['ANZAC Day', '2024-04-25'],
      ["King's Birthday", '2024-06-10'],
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

describe('AU calendar — fixed-holiday roll regression (Sat -> prev Friday, Sun -> following Monday)', () => {
  const calendar = createAUCalendar();

  // Good Friday, Easter Saturday, Easter Monday, and King's Birthday are
  // floating and never rollable, so they're not covered here. New Year's
  // Day's roll is covered by the dedicated cross-year-boundary test below.
  // Christmas Day 2026 and Boxing Day 2026's own Saturday instance are
  // deliberately excluded here — covered by the dedicated collision test.
  it.each([
    [2025, 'Australia Day', '2025-01-27', 'Sun -> following Mon'],
    [2030, 'Australia Day', '2030-01-25', 'Sat -> prev Fri'],
    [2026, 'ANZAC Day', '2026-04-24', 'Sat -> prev Fri'],
    [2027, 'ANZAC Day', '2027-04-26', 'Sun -> following Mon'],
    [2027, 'Christmas Day', '2027-12-24', 'Sat -> prev Fri'],
    [2027, 'Boxing Day', '2027-12-27', 'Sun -> following Mon'],
  ])('%i %s resolves to %s (%s)', (year, name, resolved) => {
    expect(nameOn(calendar.calculate(year), resolved)).toBe(name);
  });
});

describe("AU calendar — New Year's Day cross-year-boundary roll (2028 Jan 1 is Saturday)", () => {
  const calendar = createAUCalendar();

  it('rolls back into the PREVIOUS calendar date while still being returned by calculate(2028)', () => {
    const dates2028 = calendar.calculate(2028);
    expect(nameOn(dates2028, '2027-12-31')).toBe("New Year's Day");

    const dates2027 = calendar.calculate(2027);
    expect(nameOn(dates2027, '2027-01-01')).toBe("New Year's Day");

    expect(d('2028-01-01').dayOfWeek).toBe(6);
  });
});

describe('AU calendar — Christmas Day / Boxing Day roll collision (2026)', () => {
  const calendar = createAUCalendar();

  it("Boxing Day (raw Dec 26, a Saturday) rolls back onto Christmas Day's raw Dec 25, producing two entries on the same date", () => {
    const dates2026 = calendar.calculate(2026);
    expect(dates2026).toHaveLength(9);
    expect(namesOn(dates2026, '2026-12-25').sort()).toEqual(['Boxing Day', 'Christmas Day']);
  });
});

describe('AU calendar — scope boundary (no state-only holidays)', () => {
  const calendar = createAUCalendar();

  it('never includes Labour Day (state/territory-only in Australia, not a national public holiday)', () => {
    const names = calendar.calculate(2026).map((hd) => hd.holiday.name);
    expect(names).not.toContain('Labour Day');
  });

  it('never includes Melbourne Cup Day (Victoria-only, not a national public holiday)', () => {
    const names = calendar.calculate(2026).map((hd) => hd.holiday.name);
    expect(names).not.toContain('Melbourne Cup Day');
  });
});

describe('AU calendar — multi-year integration (2024-2028)', () => {
  const calendar = createAUCalendar();

  it('has no two holidays sharing a resolved date, except the documented 2026 Christmas/Boxing Day collision', () => {
    for (let year = 2024; year <= 2028; year++) {
      const dates = calendar.calculate(year).map((hd) => hd.date.toString());
      const expectedUnique = year === 2026 ? dates.length - 1 : dates.length;
      expect(new Set(dates).size).toBe(expectedUnique);
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
