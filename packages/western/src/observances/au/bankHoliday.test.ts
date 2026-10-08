import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { nswBankHoliday } from './bankHoliday.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('nswBankHoliday', () => {
  it.each([
    [2024, '2024-08-05'],
    [2025, '2025-08-04'],
    [2026, '2026-08-03'],
    [2027, '2027-08-02'],
    [2028, '2028-08-07'],
    [2029, '2029-08-06'],
    [2030, '2030-08-05'],
  ])('%i -> %s', (year, expected) => {
    expect(nswBankHoliday(year)?.equals(d(expected))).toBe(true);
  });

  it('always lands on a Monday between Aug 1 and Aug 7', () => {
    for (let year = 2000; year <= 2050; year++) {
      const date = nswBankHoliday(year);
      expect(date?.dayOfWeek).toBe(1);
      expect(date?.month).toBe(8);
      expect(date?.day).toBeLessThanOrEqual(7);
    }
  });
});
