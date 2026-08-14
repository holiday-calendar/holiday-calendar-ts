import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { corpusChristi } from './corpusChristi.js';
import { westernEaster, orthodoxEaster } from '../easter.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('corpusChristi (westernEaster base, adjustToSunday=false)', () => {
  const observance = corpusChristi(westernEaster, false);

  it.each([
    [2021, '2021-06-03'],
    [2022, '2022-06-16'],
    [2023, '2023-06-08'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });
});

describe('corpusChristi (westernEaster base, adjustToSunday=true)', () => {
  const observance = corpusChristi(westernEaster, true);

  it.each([
    [2021, '2021-06-06'],
    [2022, '2022-06-19'],
    [2023, '2023-06-11'],
  ])('%i -> %s', (year, expected) => {
    expect(observance(year)?.equals(d(expected))).toBe(true);
  });

  it('always lands on a Sunday', () => {
    expect(observance(2021)?.dayOfWeek).toBe(7);
    expect(observance(2022)?.dayOfWeek).toBe(7);
  });
});

describe('corpusChristi (orthodoxEaster base)', () => {
  it.each([
    [2021, false, '2021-07-01'],
    [2022, false, '2022-06-23'],
    [2021, true, '2021-07-04'],
    [2022, true, '2022-06-26'],
  ])('%i, adjustToSunday=%s -> %s', (year, adjustToSunday, expected) => {
    expect(corpusChristi(orthodoxEaster, adjustToSunday)(year)?.equals(d(expected))).toBe(true);
  });
});

describe('corpusChristi defaults', () => {
  it('defaults adjustToSunday to false when omitted', () => {
    expect(corpusChristi(westernEaster)(2021)?.equals(d('2021-06-03'))).toBe(true);
  });

  it('returns null for years before westernEaster validity', () => {
    expect(corpusChristi()(529)).toBeNull();
  });
});
