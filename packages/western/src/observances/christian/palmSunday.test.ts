import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { palmSunday } from './palmSunday.js';
import { westernEaster, orthodoxEaster } from '../easter.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('palmSunday (westernEaster base)', () => {
  const observance = palmSunday();

  it.each([
    [1583, '1583-04-03'],
    [1776, '1776-03-31'],
    [1918, '1918-03-24'],
    [2021, '2021-03-28'],
    [2022, '2022-04-10'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before westernEaster validity', () => {
    expect(observance(529)).toBeNull();
  });
});

describe('palmSunday (orthodoxEaster base)', () => {
  const observance = palmSunday(orthodoxEaster);

  it.each([
    [1583, '1583-04-03'],
    [1918, '1918-04-28'],
    [2021, '2021-04-25'],
    [2022, '2022-04-17'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });
});
