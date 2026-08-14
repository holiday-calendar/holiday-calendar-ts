import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { ascensionDay } from './ascensionDay.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('ascensionDay (westernEaster base)', () => {
  const observance = ascensionDay();

  it.each([
    [1583, '1583-05-19'],
    [1776, '1776-05-16'],
    [1918, '1918-05-09'],
    [2021, '2021-05-13'],
    [2022, '2022-05-26'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before westernEaster validity', () => {
    expect(observance(529)).toBeNull();
  });
});
