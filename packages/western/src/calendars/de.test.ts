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

describe('DE calendar — exact holiday set, non-roll-heavy year (2024)', () => {
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

describe('DE calendar — fixed-holiday roll regression (Sat -> prev Friday, Sun -> following Monday)', () => {
  const calendar = createDECalendar();

  // Each of the 5 fixed holidays hits the weekend at least once in this
  // window (confirmed by direct day-of-week check across 2024-2028); not
  // every holiday hits both Saturday AND Sunday in this 5-year span. The
  // roll function itself is exhaustively unit-tested in isolation in
  // packages/core/src/function/DateRolls.test.ts. Boxing Day's own Saturday
  // instance (2026) is deliberately excluded here — it collides with
  // Christmas Day and is covered by the dedicated collision test below.
  it.each([
    [2028, "New Year's Day", '2027-12-31', 'Sat -> prev Fri (cross-year boundary, see dedicated test below)'],
    [2027, 'Labour Day', '2027-04-30', 'Sat -> prev Fri'],
    [2026, 'German Unity Day', '2026-10-02', 'Sat -> prev Fri'],
    [2027, 'German Unity Day', '2027-10-04', 'Sun -> following Mon'],
    [2027, 'Christmas Day', '2027-12-24', 'Sat -> prev Fri'],
    [2027, 'Boxing Day', '2027-12-27', 'Sun -> following Mon'],
  ])('%i %s resolves to %s (%s)', (year, name, resolved) => {
    expect(nameOn(calendar.calculate(year), resolved)).toBe(name);
  });
});

describe("DE calendar — New Year's Day cross-year-boundary roll (2028 Jan 1 is Saturday)", () => {
  const calendar = createDECalendar();

  it('rolls back into the PREVIOUS calendar date while still being returned by calculate(2028)', () => {
    // calculate(year) computes the raw date for `year`, then rolls it — it
    // does NOT re-bucket the result back into [year-01-01, year-12-31]
    // (verified against HolidayCalendar.ts's resolve()/calculate()). So
    // 2028's New Year's Day (raw 2028-01-01, a Saturday) rolls to
    // 2027-12-31 and appears in calculate(2028)'s result, NOT calculate(2027).
    const dates2028 = calendar.calculate(2028);
    expect(nameOn(dates2028, '2027-12-31')).toBe("New Year's Day");

    // 2027's OWN New Year's Day (raw 2027-01-01, a Friday, no roll needed)
    // is a separate, independently-computed entry.
    const dates2027 = calendar.calculate(2027);
    expect(nameOn(dates2027, '2027-01-01')).toBe("New Year's Day");

    // Sanity: raw Jan 1 2028 is indeed a Saturday.
    expect(d('2028-01-01').dayOfWeek).toBe(6);
  });
});

describe('DE calendar — Christmas Day / Boxing Day roll collision (2026)', () => {
  const calendar = createDECalendar();

  it('Boxing Day (raw Dec 26, a Saturday) rolls back onto Christmas Day\'s raw Dec 25, producing two entries on the same date', () => {
    // Each fixed holiday's roll is computed independently of its neighbors
    // (HolidayCalendar.resolve() applies dateRoll per-holiday, not
    // calendar-wide), so an adjacent-day pair can collapse onto the same
    // resolved date in a year where the roll happens to land them together.
    // This is expected behavior, not a bug — it mirrors the upstream Java
    // DE calendar, which uses the same per-holiday roll rule.
    const dates2026 = calendar.calculate(2026);
    expect(dates2026).toHaveLength(9);
    expect(namesOn(dates2026, '2026-12-25').sort()).toEqual(['Boxing Day', 'Christmas Day']);
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
