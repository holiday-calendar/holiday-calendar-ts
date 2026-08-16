import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { earlyMayBankHoliday } from './earlyMayBankHoliday.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('earlyMayBankHoliday', () => {
  it.each([
    [1978, '1978-05-01'], // first valid year (degenerate: 1st Monday = 1st of month)
    [1990, '1990-05-07'], // off-cycle sanity year (holiday-calendar-java v2.1.0 fixture)
    [2015, '2015-05-04'],
    [2016, '2016-05-02'],
    [2017, '2017-05-01'],
    [2018, '2018-05-07'],
    [2019, '2019-05-06'],
    [2021, '2021-05-03'],
    [2022, '2022-05-02'],
    [2023, '2023-05-01'],
    [2024, '2024-05-06'],
    [2025, '2025-05-05'],
    [2026, '2026-05-04'],
    [2027, '2027-05-03'],
    [2099, '2099-05-04'], // far-future sanity year, weekday pattern distinct from the sampled cycle
  ])('%i -> %s (1st Monday of May)', (year, expected) => {
    expect(earlyMayBankHoliday(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before 1978 validity', () => {
    expect(earlyMayBankHoliday(1977)).toBeNull();
  });

  describe('VE-Day anniversary overrides (formula suppressed)', () => {
    it('1995: 8 May (VE50), not the formula date of 1 May', () => {
      expect(earlyMayBankHoliday(1995)?.equals(d('1995-05-08'))).toBe(true);
    });

    it('2020: 8 May (VE75), not the formula date of 4 May', () => {
      expect(earlyMayBankHoliday(2020)?.equals(d('2020-05-08'))).toBe(true);
    });
  });
});
