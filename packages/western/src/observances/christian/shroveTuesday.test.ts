import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { shroveTuesday } from './shroveTuesday.js';
import { westernEaster, orthodoxEaster } from '../easter.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('shroveTuesday (westernEaster base)', () => {
  const observance = shroveTuesday();

  it.each([
    [2021, '2021-02-16'],
    [2022, '2022-03-01'],
    [2023, '2023-02-21'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before westernEaster validity', () => {
    expect(observance(529)).toBeNull();
  });
});

describe('shroveTuesday (orthodoxEaster base)', () => {
  const observance = shroveTuesday(orthodoxEaster);

  it.each([
    [2021, '2021-03-16'],
    [2022, '2022-03-08'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });
});
