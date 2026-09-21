import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { kingsBirthday } from './kingsBirthday.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('kingsBirthday', () => {
  it.each([
    [2024, '2024-06-10'],
    [2025, '2025-06-09'],
    [2026, '2026-06-08'],
    [2027, '2027-06-14'],
    [2028, '2028-06-12'],
    [2029, '2029-06-11'],
    [2030, '2030-06-10'],
  ])('%i -> %s', (year, expected) => {
    expect(kingsBirthday(year)?.equals(d(expected))).toBe(true);
  });

  // Edge years outside the sampled cycle, hand-verified independently
  // (June 1, 2000 is a Thursday -> 1st Monday June 5 -> 2nd Monday June 12;
  // June 1, 2050 is a Wednesday -> 1st Monday June 6 -> 2nd Monday June 13).
  it.each([
    [2000, '2000-06-12'],
    [2050, '2050-06-13'],
  ])('%i -> %s (edge year outside fixture table)', (year, expected) => {
    expect(kingsBirthday(year)?.equals(d(expected))).toBe(true);
  });

  it('always lands on a Monday', () => {
    expect(kingsBirthday(2024)?.dayOfWeek).toBe(1);
    expect(kingsBirthday(2027)?.dayOfWeek).toBe(1);
  });
});
