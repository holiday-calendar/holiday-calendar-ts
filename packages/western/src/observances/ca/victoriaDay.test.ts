import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { victoriaDay } from './victoriaDay.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('victoriaDay', () => {
  it.each([
    [1845, '1845-05-19'],
    [2018, '2018-05-21'],
    [2019, '2019-05-20'],
    [2020, '2020-05-18'],
    [2021, '2021-05-24'],
    [2022, '2022-05-23'],
    [2023, '2023-05-22'],
    [2024, '2024-05-20'],
    [2025, '2025-05-19'],
  ])('%i -> %s', (year, expected) => {
    expect(victoriaDay(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before 1845', () => {
    expect(victoriaDay(1844)).toBeNull();
  });

  it('resolves to May 18, not May 25, when May 25 itself is a Monday (2026)', () => {
    expect(victoriaDay(2026)?.equals(d('2026-05-18'))).toBe(true);
  });
});
