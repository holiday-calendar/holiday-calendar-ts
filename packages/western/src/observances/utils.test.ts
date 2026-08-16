import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { nthWeekdayOfMonth, lastWeekdayOfMonth, weekdayImmediatelyBefore } from './utils.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('nthWeekdayOfMonth', () => {
  it.each([
    [2024, 1, 1, 3, '2024-01-15'], // 3rd Monday of Jan 2024
    [2024, 11, 4, 4, '2024-11-28'], // 4th Thursday of Nov 2024
    [2024, 2, 1, 1, '2024-02-05'], // 1st Monday of Feb 2024
  ])('year=%i month=%i dow=%i n=%i -> %s', (year, month, dow, n, expected) => {
    expect(nthWeekdayOfMonth(year, month, dow, n).equals(d(expected))).toBe(true);
  });
});

describe('lastWeekdayOfMonth', () => {
  it.each([
    [2024, 5, 1, '2024-05-27'], // last Monday of May 2024
    [1971, 5, 1, '1971-05-31'], // last Monday of May 1971
  ])('year=%i month=%i dow=%i -> %s', (year, month, dow, expected) => {
    expect(lastWeekdayOfMonth(year, month, dow).equals(d(expected))).toBe(true);
  });
});

describe('weekdayImmediatelyBefore', () => {
  it.each([
    ['2026-05-25', 1, '2026-05-18'], // reference date itself is a Monday -> full week back
    ['2023-05-25', 1, '2023-05-22'], // Thursday -> preceding Monday
    ['2021-05-25', 1, '2021-05-24'], // Tuesday -> preceding Monday
  ])('weekdayImmediatelyBefore(%s, Monday) -> %s', (iso, dow, expected) => {
    expect(weekdayImmediatelyBefore(d(iso), dow).equals(d(expected))).toBe(true);
  });

  it('never returns the reference date itself', () => {
    const monday = d('2026-05-25');
    const result = weekdayImmediatelyBefore(monday, 1);
    expect(result.equals(monday)).toBe(false);
  });
});
