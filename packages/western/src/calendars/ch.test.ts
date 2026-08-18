import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import type { HolidayDate } from '@holiday-calendar/core';
import { createCHCalendar, chProvider } from './ch.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

const nameOn = (dates: HolidayDate[], iso: string): string | undefined =>
  dates.find((hd) => hd.date.equals(d(iso)))?.holiday.name;

const namesOn = (dates: HolidayDate[], iso: string): string[] =>
  dates.filter((hd) => hd.date.equals(d(iso))).map((hd) => hd.holiday.name);

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

describe('CH calendar — fixed-holiday roll regression (Sat -> prev Friday, Sun -> following Monday)', () => {
  const calendar = createCHCalendar();

  // Good Friday, Easter Monday, Ascension Day, and Whit Monday are floating
  // and never rollable, so they're not covered here. The roll function
  // itself is exhaustively unit-tested in isolation in
  // packages/core/src/function/DateRolls.test.ts.
  it.each([
    [2021, 'Labour Day', '2021-04-30', 'Sat -> prev Fri'],
    [2021, 'Swiss National Day', '2021-08-02', 'Sun -> following Mon'],
    [2021, 'Christmas Day', '2021-12-24', 'Sat -> prev Fri'],
    [2021, 'Boxing Day', '2021-12-27', 'Sun -> following Mon'],
    [2022, 'Swiss National Day', '2022-08-01', 'Mon, no roll'],
    [2024, 'Labour Day', '2024-05-01', 'Wed, no roll'],
    [2024, 'Swiss National Day', '2024-08-01', 'Thu, no roll'],
    [2027, 'Labour Day', '2027-04-30', 'Sat -> prev Fri'],
    [2027, 'Swiss National Day', '2027-08-02', 'Sun -> following Mon'],
    [2027, 'Christmas Day', '2027-12-24', 'Sat -> prev Fri'],
    [2027, 'Boxing Day', '2027-12-27', 'Sun -> following Mon'],
  ])('%i %s resolves to %s (%s)', (year, name, resolved) => {
    expect(nameOn(calendar.calculate(year), resolved)).toBe(name);
  });
});

describe('CH calendar — Christmas Day / Boxing Day collision (adjacent fixed dates rolling onto each other)', () => {
  const calendar = createCHCalendar();

  // Dec 25 (Christmas Day) and Dec 26 (Boxing Day) are adjacent fixed
  // dates under previousFridayOrFollowingMonday(): when Dec 25 is a Sunday,
  // it rolls forward onto Dec 26, colliding with Boxing Day's own Monday
  // date; when Dec 26 is a Saturday, it rolls back onto Dec 25, colliding
  // with Christmas Day's own Friday date. HolidayCalendar.calculate() does
  // not dedupe by resolved date (confirmed by reading resolve()/calculate()
  // in packages/core/src/HolidayCalendar.ts — it only sorts), so calculate()
  // returns BOTH holidays as separate entries sharing one date. This is
  // expected, not a bug.
  it("2022: Sun Dec 25 rolls onto Boxing Day's Dec 26 — both entries present", () => {
    const dates = calendar.calculate(2022);
    expect(namesOn(dates, '2022-12-26').sort()).toEqual(['Boxing Day', 'Christmas Day']);
    expect(dates).toHaveLength(9);
  });

  it("2026: Sat Dec 26 rolls onto Christmas Day's Dec 25 — both entries present", () => {
    const dates = calendar.calculate(2026);
    expect(namesOn(dates, '2026-12-25').sort()).toEqual(['Boxing Day', 'Christmas Day']);
    expect(dates).toHaveLength(9);
  });
});

describe("CH calendar — New Year's Day cross-year-boundary roll (2022 Jan 1 is Saturday)", () => {
  const calendar = createCHCalendar();

  it('rolls back into the PREVIOUS calendar date while still being returned by calculate(2022)', () => {
    // calculate(year) computes the raw date for `year`, then rolls it — it
    // does NOT re-bucket the result back into [year-01-01, year-12-31]
    // (verified against HolidayCalendar.ts's resolve()/calculate()). So
    // 2022's New Year's Day (raw 2022-01-01, a Saturday) rolls to
    // 2021-12-31 and appears in calculate(2022)'s result, NOT calculate(2021).
    const dates2022 = calendar.calculate(2022);
    expect(nameOn(dates2022, '2021-12-31')).toBe("New Year's Day");

    // 2021's OWN New Year's Day (raw 2021-01-01, a Friday, no roll needed)
    // is a separate, independently-computed entry — calculate(year) always
    // resolves that year's own holiday instances, so 2021 having its own
    // Jan 1 entry does not contradict 2022's rolled entry landing on Dec 31.
    const dates2021 = calendar.calculate(2021);
    expect(nameOn(dates2021, '2021-01-01')).toBe("New Year's Day");

    // Sanity: raw Jan 1 2022 is indeed a Saturday.
    expect(d('2022-01-01').dayOfWeek).toBe(6);
  });
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

  it('has no unexpected duplicate resolved dates across 2024-2028', () => {
    // Unlike FR, CH is NOT guaranteed collision-free: Christmas Day (Dec 25)
    // and Boxing Day (Dec 26) are adjacent fixed rollable holidays, so when
    // Dec 25 is a Sunday or Dec 26 is a Saturday, previousFridayOrFollowingMonday()
    // rolls one onto the other's date (see the dedicated collision describe
    // block above; 2026 falls within this span). Any duplicate resolved
    // date found here must be exactly that Christmas/Boxing collision —
    // anything else would indicate a real bug.
    for (let year = 2024; year <= 2028; year++) {
      const dates = calendar.calculate(year);
      const byDate = new Map<string, string[]>();
      for (const hd of dates) {
        const iso = hd.date.toString();
        byDate.set(iso, [...(byDate.get(iso) ?? []), hd.holiday.name]);
      }
      for (const names of byDate.values()) {
        if (names.length > 1) {
          expect(names.sort()).toEqual(['Boxing Day', 'Christmas Day']);
        } else {
          expect(names).toHaveLength(1);
        }
      }
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
