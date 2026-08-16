import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { thanksgiving } from './thanksgiving.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('thanksgiving (Canada)', () => {
  it.each([
    [2018, '2018-10-08'],
    [2019, '2019-10-14'],
    [2020, '2020-10-12'],
    [2021, '2021-10-11'],
    [2022, '2022-10-10'],
    [2023, '2023-10-09'],
  ])('%i -> %s', (year, expected) => {
    expect(thanksgiving(year)?.equals(d(expected))).toBe(true);
  });

  it('resolves for an early year (no year guard, unlike US Thanksgiving)', () => {
    expect(thanksgiving(1900)?.equals(d('1900-10-08'))).toBe(true);
  });
});
