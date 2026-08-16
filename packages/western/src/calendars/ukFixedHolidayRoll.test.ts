import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { ukFixedHolidayRoll } from './uk.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('ukFixedHolidayRoll', () => {
  it('a Sunday collision resolves to +1 for New Year\'s Day but +2 for Christmas/Boxing Day', () => {
    // 2023-01-01 is a Sunday -> New Year's Day rolls +1 to Jan 2
    expect(ukFixedHolidayRoll(d('2023-01-01')).equals(d('2023-01-02'))).toBe(true);
    // 2022-12-25 is a Sunday -> Christmas Day rolls +2 to Dec 27
    expect(ukFixedHolidayRoll(d('2022-12-25')).equals(d('2022-12-27'))).toBe(true);
    // 2021-12-26 is a Sunday -> Boxing Day rolls +2 to Dec 28
    expect(ukFixedHolidayRoll(d('2021-12-26')).equals(d('2021-12-28'))).toBe(true);
  });

  it('a Saturday collision resolves to +2 regardless of which holiday', () => {
    // 2022-01-01 is a Saturday -> New Year's Day rolls +2 to Jan 3
    expect(ukFixedHolidayRoll(d('2022-01-01')).equals(d('2022-01-03'))).toBe(true);
    // 2021-12-25 is a Saturday -> Christmas Day rolls +2 to Dec 27
    expect(ukFixedHolidayRoll(d('2021-12-25')).equals(d('2021-12-27'))).toBe(true);
    // 2026-12-26 is a Saturday -> Boxing Day rolls +2 to Dec 28
    expect(ukFixedHolidayRoll(d('2026-12-26')).equals(d('2026-12-28'))).toBe(true);
  });

  it.each([
    ['2024-01-01', '2024-01-01'], // Monday, no roll
    ['2019-01-01', '2019-01-01'], // Tuesday, no roll
    ['2025-01-01', '2025-01-01'], // Wednesday, no roll
    ['2026-01-01', '2026-01-01'], // Thursday, no roll
    ['2027-01-01', '2027-01-01'], // Friday, no roll
    ['2024-12-25', '2024-12-25'], // Wednesday, no roll
    ['2023-12-26', '2023-12-26'], // Tuesday, no roll
  ])('%s stays %s on a weekday', (input, expected) => {
    expect(ukFixedHolidayRoll(d(input)).equals(d(expected))).toBe(true);
  });
});
