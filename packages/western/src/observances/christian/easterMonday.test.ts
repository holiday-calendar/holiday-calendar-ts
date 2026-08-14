import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { easterMonday } from './easterMonday.js';
import { westernEaster, orthodoxEaster } from '../easter.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('easterMonday (westernEaster base)', () => {
  const observance = easterMonday();

  it.each([
    [1583, '1583-04-11'],
    [1776, '1776-04-08'],
    [1918, '1918-04-01'],
    [2021, '2021-04-05'],
    [2022, '2022-04-18'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before westernEaster validity', () => {
    expect(observance(529)).toBeNull();
  });
});

describe('easterMonday (orthodoxEaster base)', () => {
  const observance = easterMonday(orthodoxEaster);

  it.each([
    [1583, '1583-04-11'],
    [1918, '1918-05-06'],
    [2021, '2021-05-03'],
    [2022, '2022-04-25'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });
});
