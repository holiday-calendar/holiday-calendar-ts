import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, it } from 'vitest';
import { dateForYear, earlyCloseHoliday, fixedHoliday, floatingHoliday, specialAnniversary } from './Holiday.js';
import { makeObservance } from './function/Observance.js';
import { HolidayCalendar } from './HolidayCalendar.js';

describe('earlyCloseHoliday', () => {
  it('constructs with type "earlyClose" and passes through all fields', () => {
    const observance = makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 3 }));
    const closeTime = Temporal.PlainTime.from('13:00');
    const holiday = earlyCloseHoliday({
      name: 'Early Close',
      description: 'Day before Independence Day',
      observance,
      closeTime,
      timeZoneId: 'America/New_York',
    });

    expect(holiday.type).toBe('earlyClose');
    expect(holiday.name).toBe('Early Close');
    expect(holiday.description).toBe('Day before Independence Day');
    expect(holiday.observance).toBe(observance);
    expect(holiday.closeTime.equals(closeTime)).toBe(true);
    expect(holiday.timeZoneId).toBe('America/New_York');
  });

  it('omits description when not provided', () => {
    const holiday = earlyCloseHoliday({
      name: 'Early Close',
      observance: makeObservance((year) => Temporal.PlainDate.from({ year, month: 12, day: 24 })),
      closeTime: Temporal.PlainTime.from('13:00'),
      timeZoneId: 'America/New_York',
    });

    expect(holiday.description).toBeUndefined();
  });

  it('has no rollable field', () => {
    const holiday = earlyCloseHoliday({
      name: 'Early Close',
      observance: makeObservance((year) => Temporal.PlainDate.from({ year, month: 12, day: 24 })),
      closeTime: Temporal.PlainTime.from('13:00'),
      timeZoneId: 'America/New_York',
    });

    expect('rollable' in holiday).toBe(false);
  });
});

describe('dateForYear — earlyClose', () => {
  it('delegates to the observance for a year where it occurs', () => {
    const holiday = earlyCloseHoliday({
      name: 'Early Close',
      observance: makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 3 })),
      closeTime: Temporal.PlainTime.from('13:00'),
      timeZoneId: 'America/New_York',
    });

    const result = dateForYear(holiday, 2025);
    expect(result?.equals(Temporal.PlainDate.from({ year: 2025, month: 7, day: 3 }))).toBe(true);
  });

  it('returns null for a year the observance excludes', () => {
    const holiday = earlyCloseHoliday({
      name: 'Early Close',
      observance: makeObservance(
        (year) => Temporal.PlainDate.from({ year, month: 7, day: 3 }),
        (year) => year !== 2026,
      ),
      closeTime: Temporal.PlainTime.from('13:00'),
      timeZoneId: 'America/New_York',
    });

    expect(dateForYear(holiday, 2026)).toBeNull();
    expect(dateForYear(holiday, 2025)).not.toBeNull();
  });
});

describe('HolidayCalendar.calculate() excludes earlyClose holidays', () => {
  it('returns only the non-earlyClose holiday', () => {
    const calendar = new HolidayCalendar({
      code: 'TEST',
      holidays: [
        fixedHoliday({ name: 'New Year', month: 1, day: 1 }),
        earlyCloseHoliday({
          name: 'Early Close',
          observance: makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 3 })),
          closeTime: Temporal.PlainTime.from('13:00'),
          timeZoneId: 'America/New_York',
        }),
      ],
    });

    const result = calendar.calculate(2025);
    expect(result).toHaveLength(1);
    expect(result.every((r) => r.holiday.type !== 'earlyClose')).toBe(true);
  });

  it('returns an empty array for a calendar of only earlyClose holidays', () => {
    const calendar = new HolidayCalendar({
      code: 'TEST',
      holidays: [
        earlyCloseHoliday({
          name: 'Early Close',
          observance: makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 3 })),
          closeTime: Temporal.PlainTime.from('13:00'),
          timeZoneId: 'America/New_York',
        }),
      ],
    });

    expect(calendar.calculate(2025)).toEqual([]);
  });

  it('excludes earlyClose from a mix of fixed, floating, anniversary and earlyClose', () => {
    const calendar = new HolidayCalendar({
      code: 'TEST',
      holidays: [
        fixedHoliday({ name: "New Year's Day", month: 1, day: 1 }),
        earlyCloseHoliday({
          name: 'July 3rd Early Close',
          observance: makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 3 })),
          closeTime: Temporal.PlainTime.from('13:00'),
          timeZoneId: 'America/New_York',
        }),
        floatingHoliday({
          name: 'Labor Day',
          observance: makeObservance((year) => {
            let date = Temporal.PlainDate.from({ year, month: 9, day: 1 });
            while (date.dayOfWeek !== 1) date = date.add({ days: 1 });
            return date;
          }),
        }),
        specialAnniversary({
          name: 'Founding Jubilee',
          date: Temporal.PlainDate.from({ year: 2025, month: 3, day: 15 }),
        }),
      ],
    });

    const result = calendar.calculate(2025);
    const expected: Array<[string, string]> = [
      ["New Year's Day", '2025-01-01'],
      ['Founding Jubilee', '2025-03-15'],
      ['Labor Day', '2025-09-01'],
    ];
    expect(result).toHaveLength(3);
    result.forEach((entry, i) => {
      expect(entry.holiday.name).toBe(expected[i][0]);
      expect(entry.date.equals(Temporal.PlainDate.from(expected[i][1]))).toBe(true);
    });
  });
});
