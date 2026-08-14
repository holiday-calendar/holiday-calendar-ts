import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { whitSunday } from './whitSunday.js';
import { westernEaster, orthodoxEaster } from '../easter.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('whitSunday (westernEaster base)', () => {
  const observance = whitSunday();

  it.each([
    [2021, '2021-05-23'],
    [2022, '2022-06-05'],
    [2023, '2023-05-28'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before westernEaster validity', () => {
    expect(observance(529)).toBeNull();
  });
});

describe('whitSunday (orthodoxEaster base)', () => {
  const observance = whitSunday(orthodoxEaster);

  it.each([
    [2021, '2021-06-20'],
    [2022, '2022-06-12'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });
});
