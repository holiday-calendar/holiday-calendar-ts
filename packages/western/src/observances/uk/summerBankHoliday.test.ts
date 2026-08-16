import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { summerBankHoliday } from './summerBankHoliday.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('summerBankHoliday', () => {
  it.each([
    [1977, '1977-08-29'], // off-cycle sanity year (holiday-calendar-java v2.1.0 fixture)
    [1990, '1990-08-27'], // off-cycle sanity year (holiday-calendar-java v2.1.0 fixture)
    [2015, '2015-08-31'],
    [2016, '2016-08-29'],
    [2017, '2017-08-28'],
    [2018, '2018-08-27'],
    [2019, '2019-08-26'],
    [2020, '2020-08-31'],
    [2021, '2021-08-30'],
    [2022, '2022-08-29'],
    [2023, '2023-08-28'],
    [2024, '2024-08-26'],
    [2025, '2025-08-25'],
    [2026, '2026-08-31'],
    [2027, '2027-08-30'],
    [2099, '2099-08-31'], // far-future sanity year
  ])('%i -> %s (last Monday of August)', (year, expected) => {
    expect(summerBankHoliday(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before 1971 validity', () => {
    expect(summerBankHoliday(1970)).toBeNull();
  });
});
