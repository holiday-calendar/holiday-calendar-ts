import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { springBankHoliday } from './springBankHoliday.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('springBankHoliday', () => {
  it.each([
    [1990, '1990-05-28'], // off-cycle sanity year (holiday-calendar-java v2.1.0 fixture)
    [2015, '2015-05-25'],
    [2016, '2016-05-30'],
    [2017, '2017-05-29'],
    [2018, '2018-05-28'],
    [2019, '2019-05-27'],
    [2020, '2020-05-25'],
    [2021, '2021-05-31'],
    [2023, '2023-05-29'],
    [2024, '2024-05-27'],
    [2025, '2025-05-26'],
    [2026, '2026-05-25'],
    [2027, '2027-05-31'],
  ])('%i -> %s (last Monday of May)', (year, expected) => {
    expect(springBankHoliday(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before 1971 validity', () => {
    expect(springBankHoliday(1970)).toBeNull();
  });

  describe('Jubilee year moves (formula suppressed)', () => {
    it('1977: Silver Jubilee -> 6 June, not the formula date of 30 May', () => {
      expect(springBankHoliday(1977)?.equals(d('1977-06-06'))).toBe(true);
    });

    it('2002: Golden Jubilee -> 4 June, not the formula date of 27 May', () => {
      expect(springBankHoliday(2002)?.equals(d('2002-06-04'))).toBe(true);
    });

    it('2012: Diamond Jubilee -> 4 June, not the formula date of 28 May', () => {
      expect(springBankHoliday(2012)?.equals(d('2012-06-04'))).toBe(true);
    });

    it('2022: Platinum Jubilee -> 2 June, not the formula date of 30 May', () => {
      expect(springBankHoliday(2022)?.equals(d('2022-06-02'))).toBe(true);
    });
  });
});
