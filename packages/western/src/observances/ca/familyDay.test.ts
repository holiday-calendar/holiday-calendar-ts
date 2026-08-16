import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { familyDay } from './familyDay.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('familyDay', () => {
  it.each([
    [1990, '1990-02-19'],
    [2018, '2018-02-19'],
    [2019, '2019-02-18'],
    [2020, '2020-02-17'],
    [2021, '2021-02-15'],
    [2022, '2022-02-21'],
    [2023, '2023-02-20'],
  ])('%i -> %s', (year, expected) => {
    expect(familyDay(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before 1990', () => {
    expect(familyDay(1989)).toBeNull();
  });
});
