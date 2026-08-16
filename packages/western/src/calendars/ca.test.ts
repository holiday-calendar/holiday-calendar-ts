import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { createCACalendar, caProvider } from './ca.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('createCACalendar', () => {
  it('returns exactly 13 holidays for 2023, with exact resolved dates', () => {
    const calendar = createCACalendar();
    const results = calendar.calculate(2023).map((hd) => [hd.holiday.name, hd.date.toString()]);

    expect(results).toEqual([
      ["New Year's Day", '2023-01-02'], // Sun -> following Monday
      ['Family Day', '2023-02-20'],
      ['Good Friday', '2023-04-07'],
      ['Easter Monday', '2023-04-10'],
      ['Victoria Day', '2023-05-22'],
      ['Canada Day', '2023-07-03'], // Sat -> following Monday
      ['Civic Holiday', '2023-08-07'],
      ['Labour Day', '2023-09-04'],
      ['National Day For Truth and Reconciliation', '2023-10-02'], // Sat -> following Monday
      ['Thanksgiving Day', '2023-10-09'],
      ['Remembrance Day', '2023-11-13'], // Sat -> following Monday
      ['Christmas Day', '2023-12-25'],
      ['Boxing Day', '2023-12-26'],
    ]);
  });

  it(
    'rolls NDTR from Sat Sep 30 to Mon Oct 2 (2023), matching Java v2.1.0 — NOT non-rollable as the issue text claimed',
    () => {
      const calendar = createCACalendar();
      const ndtr = calendar
        .calculate(2023)
        .find((hd) => hd.holiday.name === 'National Day For Truth and Reconciliation');
      expect(ndtr?.date.equals(d('2023-10-02'))).toBe(true);
    },
  );

  it.each([2019, 2020])('omits NDTR entirely for %i (before 2021 inception)', (year) => {
    const calendar = createCACalendar();
    const results = calendar.calculate(year);
    expect(
      results.some((hd) => hd.holiday.name === 'National Day For Truth and Reconciliation'),
    ).toBe(false);
  });

  it('never rolls Christmas Day or Boxing Day, even when they fall on a weekend (2021)', () => {
    const calendar = createCACalendar();
    const results = calendar.calculate(2021);
    const christmas = results.find((hd) => hd.holiday.name === 'Christmas Day');
    const boxingDay = results.find((hd) => hd.holiday.name === 'Boxing Day');

    // 2021-12-25 is a Saturday, 2021-12-26 is a Sunday.
    expect(christmas?.date.equals(d('2021-12-25'))).toBe(true);
    expect(boxingDay?.date.equals(d('2021-12-26'))).toBe(true);
  });

  it('sorts calculate() output chronologically regardless of registration order', () => {
    const calendar = createCACalendar();
    const results = calendar.calculate(2023);
    for (let i = 1; i < results.length; i++) {
      expect(Temporal.PlainDate.compare(results[i - 1].date, results[i].date)).toBeLessThanOrEqual(0);
    }
  });

  it('has zero early closes', () => {
    const calendar = createCACalendar();
    expect(calendar.hasEarlyCloses()).toBe(false);
  });

  it("does not carry us.ts's NYSE-specific Good Friday description", () => {
    const calendar = createCACalendar();
    const goodFriday = calendar.calculate(2023).find((hd) => hd.holiday.name === 'Good Friday');
    expect(goodFriday?.holiday.description).not.toMatch(/NYSE/);
  });

  it('has no two holidays sharing a resolved date across 2021-2028', () => {
    const calendar = createCACalendar();
    for (let year = 2021; year <= 2028; year++) {
      const dates = calendar.calculate(year).map((hd) => hd.date.toString());
      expect(new Set(dates).size).toBe(dates.length);
    }
  });
});

describe('caProvider', () => {
  it('exposes the CA code and region name', () => {
    expect(caProvider.code).toBe('CA');
    expect(caProvider.region).toBe('Canada National Holidays');
  });
});
