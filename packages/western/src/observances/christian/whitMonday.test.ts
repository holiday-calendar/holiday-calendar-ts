import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { whitMonday } from './whitMonday.js';
import { westernEaster, orthodoxEaster } from '../easter.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('whitMonday (westernEaster base)', () => {
  const observance = whitMonday();

  it.each([
    [2021, '2021-05-24'],
    [2022, '2022-06-06'],
    [2023, '2023-05-29'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before westernEaster validity', () => {
    expect(observance(529)).toBeNull();
  });
});

describe('whitMonday (orthodoxEaster base)', () => {
  const observance = whitMonday(orthodoxEaster);

  it.each([
    [2021, '2021-06-21'],
    [2022, '2022-06-13'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });
});
