import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import type { HolidayDate } from '@holiday-calendar/core';
import { createAUCalendar, auProvider, auFixedHolidayRoll } from './au.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

const namesOn = (dates: HolidayDate[], iso: string): string[] =>
  dates.filter((hd) => hd.date.equals(d(iso))).map((hd) => hd.holiday.name);

const nameOn = (dates: HolidayDate[], iso: string): string | undefined => namesOn(dates, iso)[0];

describe('auFixedHolidayRoll', () => {
  it('rolls a Saturday forward by 2 days regardless of which holiday', () => {
    // 2028-01-01 is a Saturday -> New Year's Day rolls +2 to Jan 3
    expect(auFixedHolidayRoll(d('2028-01-01')).equals(d('2028-01-03'))).toBe(true);
    // 2030-01-26 is a Saturday -> Australia Day rolls +2 to Jan 28
    expect(auFixedHolidayRoll(d('2030-01-26')).equals(d('2030-01-28'))).toBe(true);
    // 2027-12-25 is a Saturday -> Christmas Day rolls +2 to Dec 27
    expect(auFixedHolidayRoll(d('2027-12-25')).equals(d('2027-12-27'))).toBe(true);
    // 2026-12-26 is a Saturday -> Boxing Day rolls +2 to Dec 28
    expect(auFixedHolidayRoll(d('2026-12-26')).equals(d('2026-12-28'))).toBe(true);
  });

  it('rolls a Sunday forward by 1 day for non-Christmas/Boxing holidays', () => {
    // 2025-01-26 is a Sunday -> Australia Day rolls +1 to Jan 27
    expect(auFixedHolidayRoll(d('2025-01-26')).equals(d('2025-01-27'))).toBe(true);
    // 2027-04-25 is a Sunday -> ANZAC Day rolls +1 to Apr 26
    expect(auFixedHolidayRoll(d('2027-04-25')).equals(d('2027-04-26'))).toBe(true);
  });

  it('rolls a Sunday forward by 2 days for Christmas Day/Boxing Day, to avoid colliding with each other', () => {
    // 2022-12-25 is a Sunday -> Christmas Day rolls +2 to Dec 27 (Dec 26,
    // the following Monday, is already Boxing Day)
    expect(auFixedHolidayRoll(d('2022-12-25')).equals(d('2022-12-27'))).toBe(true);
    // 2021-12-26 is a Sunday -> Boxing Day rolls +2 to Dec 28
    expect(auFixedHolidayRoll(d('2021-12-26')).equals(d('2021-12-28'))).toBe(true);
  });

  it.each([
    ['2024-01-01', '2024-01-01'], // Monday, no roll
    ['2024-01-26', '2024-01-26'], // Friday, no roll
    ['2024-04-25', '2024-04-25'], // Thursday, no roll
    ['2024-12-25', '2024-12-25'], // Wednesday, no roll
    ['2024-12-26', '2024-12-26'], // Thursday, no roll
  ])('%s stays %s on a weekday', (input, expected) => {
    expect(auFixedHolidayRoll(d(input)).equals(d(expected))).toBe(true);
  });
});

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

describe('AU calendar — fixed-holiday roll regression (Sat -> +2, Sun -> +1, Christmas/Boxing Sun -> +2)', () => {
  const calendar = createAUCalendar();

  // Good Friday, Easter Saturday, Easter Monday, and King's Birthday are
  // floating and never rollable, so they're not covered here. New Year's
  // Day and the Christmas/Boxing Day cascade get their own dedicated tests
  // below, not duplicated here.
  it.each([
    [2025, 'Australia Day', '2025-01-27', 'Sun -> +1'],
    [2030, 'Australia Day', '2030-01-28', 'Sat -> +2'],
    [2026, 'ANZAC Day', '2026-04-27', 'Sat -> +2'],
    [2027, 'ANZAC Day', '2027-04-26', 'Sun -> +1'],
  ])('%i %s resolves to %s (%s)', (year, name, resolved) => {
    expect(nameOn(calendar.calculate(year), resolved)).toBe(name);
  });
});

describe("AU calendar — New Year's Day weekend roll (2028 Jan 1 is Saturday)", () => {
  const calendar = createAUCalendar();

  it('rolls forward to the following Monday, within the same year', () => {
    const dates2028 = calendar.calculate(2028);
    expect(nameOn(dates2028, '2028-01-03')).toBe("New Year's Day");
    expect(d('2028-01-01').dayOfWeek).toBe(6);
  });
});

describe('AU calendar — Christmas Day / Boxing Day weekend cascade (2027)', () => {
  const calendar = createAUCalendar();

  it('Christmas Day (Sat) rolls to Monday and Boxing Day (Sun) rolls past it to Tuesday, avoiding a collision', () => {
    const dates2027 = calendar.calculate(2027);
    expect(dates2027).toHaveLength(9);
    expect(nameOn(dates2027, '2027-12-27')).toBe('Christmas Day');
    expect(nameOn(dates2027, '2027-12-28')).toBe('Boxing Day');
  });
});

describe('AU calendar — ANZAC Day / Easter Monday collision (2038)', () => {
  const calendar = createAUCalendar();

  it('ANZAC Day (rolled) and Easter Monday both land on 2038-04-26, since Easter Sunday 2038 falls on Apr 25', () => {
    // 2038 is the next year (after 1943) in which western Easter Sunday
    // falls on its latest possible date, Apr 25 — which also happens to be
    // ANZAC Day's raw fixed date. Since Easter Sunday is always a Sunday,
    // ANZAC Day (raw Apr 25, rollable) rolls +1 to Apr 26 under
    // auFixedHolidayRoll — the same date as Easter Monday (Easter Sunday +
    // 1, not rollable). This is a rare cross-holiday-type collision, not a
    // roll-rule bug: each holiday's date is computed independently, and the
    // DateRoll function has no visibility into other holidays' dates to
    // avoid it (unlike the Christmas/Boxing Day cascade, which is handled
    // deliberately because those two dates are always exactly 1 day apart).
    expect(d('2038-04-25').dayOfWeek).toBe(7); // Sunday: Easter Sunday and raw ANZAC Day
    const dates2038 = calendar.calculate(2038);
    expect(dates2038).toHaveLength(9);
    expect(namesOn(dates2038, '2038-04-26').sort()).toEqual(['ANZAC Day', 'Easter Monday']);
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
