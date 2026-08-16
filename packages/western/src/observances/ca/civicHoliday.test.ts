import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { civicHoliday } from './civicHoliday.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('civicHoliday', () => {
  it.each([
    [2018, '2018-08-06'],
    [2019, '2019-08-05'],
    [2020, '2020-08-03'],
    [2021, '2021-08-02'],
    [2022, '2022-08-01'],
    [2023, '2023-08-07'],
  ])('%i -> %s', (year, expected) => {
    expect(civicHoliday(year)?.equals(d(expected))).toBe(true);
  });

  it('resolves for an early year (no year guard, unlike most other CA observances)', () => {
    expect(civicHoliday(1900)?.equals(d('1900-08-06'))).toBe(true);
  });
});
