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

describe('FR calendar — exact holiday set, non-roll-heavy year (2026)', () => {
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
      ['Assumption Day', '2026-08-14'], // Sat -> rolls to previous Friday
      ["All Saints' Day", '2026-11-02'], // Sun -> rolls to following Monday
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

describe('FR calendar — fixed-holiday roll regression (Sat -> prev Friday, Sun -> following Monday)', () => {
  const calendar = createFRCalendar();

  // Each of the 8 fixed holidays hits the weekend at least once in this
  // window (confirmed by direct day-of-week check across 2024-2028); not
  // every holiday hits both Saturday AND Sunday in this 5-year span, since
  // several share day-of-week offsets that are multiples of 7 apart. The
  // roll function itself is exhaustively unit-tested in isolation in
  // packages/core/src/function/DateRolls.test.ts.
  it.each([
    [2028, "New Year's Day", '2027-12-31', 'Sat -> prev Fri (cross-year boundary, see dedicated test below)'],
    [2027, 'Labour Day', '2027-04-30', 'Sat -> prev Fri'],
    [2028, 'Labour Day', '2028-05-01', 'Mon, no roll'],
    [2027, 'Victory in Europe Day', '2027-05-07', 'Sat -> prev Fri'],
    [2024, 'Bastille Day', '2024-07-15', 'Sun -> following Mon'],
    [2026, 'Assumption Day', '2026-08-14', 'Sat -> prev Fri'],
    [2027, 'Assumption Day', '2027-08-16', 'Sun -> following Mon'],
    [2025, "All Saints' Day", '2025-10-31', 'Sat -> prev Fri'],
    [2026, "All Saints' Day", '2026-11-02', 'Sun -> following Mon'],
    [2028, 'Armistice Day', '2028-11-10', 'Sat -> prev Fri'],
    [2027, 'Christmas Day', '2027-12-24', 'Sat -> prev Fri'],
  ])('%i %s resolves to %s (%s)', (year, name, resolved) => {
    expect(nameOn(calendar.calculate(year), resolved)).toBe(name);
  });
});

describe("FR calendar — New Year's Day cross-year-boundary roll (2028 Jan 1 is Saturday)", () => {
  const calendar = createFRCalendar();

  it('rolls back into the PREVIOUS calendar date while still being returned by calculate(2028)', () => {
    // calculate(year) computes the raw date for `year`, then rolls it — it
    // does NOT re-bucket the result back into [year-01-01, year-12-31]
    // (verified against HolidayCalendar.ts's resolve()/calculate()). So
    // 2028's New Year's Day (raw 2028-01-01, a Saturday) rolls to
    // 2027-12-31 and appears in calculate(2028)'s result, NOT calculate(2027).
    const dates2028 = calendar.calculate(2028);
    expect(nameOn(dates2028, '2027-12-31')).toBe("New Year's Day");

    // 2027's OWN New Year's Day (raw 2027-01-01, a Friday, no roll needed)
    // is a separate, independently-computed entry — calculate(year) always
    // resolves that year's own holiday instances, so 2027 having its own
    // Jan 1 entry does not contradict 2028's rolled entry landing on Dec 31.
    const dates2027 = calendar.calculate(2027);
    expect(nameOn(dates2027, '2027-01-01')).toBe("New Year's Day");

    // Sanity: raw Jan 1 2028 is indeed a Saturday.
    expect(d('2028-01-01').dayOfWeek).toBe(6);
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
