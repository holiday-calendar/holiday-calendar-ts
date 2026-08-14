import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { ashWednesday } from './ashWednesday.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('ashWednesday (westernEaster base)', () => {
  const observance = ashWednesday();

  it.each([
    [1583, '1583-02-23'],
    [1776, '1776-02-21'],
    [1918, '1918-02-13'],
    [2021, '2021-02-17'],
    [2022, '2022-03-02'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before westernEaster validity', () => {
    expect(observance(529)).toBeNull();
  });
});
