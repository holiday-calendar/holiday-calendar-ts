import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { labourDay } from './labourDay.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('labourDay', () => {
  it.each([
    [1894, '1894-09-03'],
    [2018, '2018-09-03'],
    [2019, '2019-09-02'],
    [2020, '2020-09-07'],
    [2021, '2021-09-06'],
    [2022, '2022-09-05'],
    [2023, '2023-09-04'],
  ])('%i -> %s', (year, expected) => {
    expect(labourDay(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before 1894', () => {
    expect(labourDay(1893)).toBeNull();
  });
});
