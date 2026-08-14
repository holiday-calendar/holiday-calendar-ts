import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, it, vi } from 'vitest';
import { earlyCloseHoliday, fixedHoliday, floatingHoliday, specialAnniversary } from './Holiday.js';
import type { EarlyCloseHoliday } from './Holiday.js';
import { makeObservance } from './function/Observance.js';
import { DateRolls } from './function/DateRolls.js';
import { HolidayCalendar } from './HolidayCalendar.js';

const NY_13 = { closeTime: Temporal.PlainTime.from('13:00'), timeZoneId: 'America/New_York' };

const july3 = makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 3 }));
const christmasEve = makeObservance((year) => Temporal.PlainDate.from({ year, month: 12, day: 24 }));
const dayAfterThanksgiving = makeObservance((year) => {
  let date = Temporal.PlainDate.from({ year, month: 11, day: 1 });
  let thursdays = 0;
  while (thursdays < 4) {
    if (date.dayOfWeek === 4) thursdays++;
    if (thursdays === 4) break;
    date = date.add({ days: 1 });
  }
  return date.add({ days: 1 });
});
const laborDayObservance = makeObservance((year) => {
  let date = Temporal.PlainDate.from({ year, month: 9, day: 1 });
  while (date.dayOfWeek !== 1) date = date.add({ days: 1 });
  return date;
});

function makeCalendar(): HolidayCalendar {
  return new HolidayCalendar({
    code: 'XNYS-TEST',
    dateRoll: DateRolls.previousFridayOrFollowingMonday(),
    holidays: [
      // Declared out of date order to exercise sorting.
      earlyCloseHoliday({ name: 'Christmas Eve', observance: christmasEve, ...NY_13 }),
      fixedHoliday({ name: "New Year's Day", month: 1, day: 1 }),
      earlyCloseHoliday({ name: 'Day After Thanksgiving', observance: dayAfterThanksgiving, ...NY_13 }),
      floatingHoliday({ name: 'Labor Day', observance: laborDayObservance }),
      earlyCloseHoliday({ name: 'July 3rd', observance: july3, ...NY_13 }),
    ],
  });
}

function makeNoEarlyCloseCalendar(): HolidayCalendar {
  return new HolidayCalendar({
    code: 'NO-EARLY-CLOSE',
    holidays: [
      fixedHoliday({ name: "New Year's Day", month: 1, day: 1 }),
      floatingHoliday({ name: 'Labor Day', observance: laborDayObservance }),
    ],
  });
}

function makeEmptyCalendar(): HolidayCalendar {
  return new HolidayCalendar({ code: 'EMPTY', holidays: [] });
}

describe('HolidayCalendar.calculateEarlyCloses()', () => {
  it('returns only earlyClose entries from a mixed calendar', () => {
    const result = makeCalendar().calculateEarlyCloses(2025);
    expect(result).toHaveLength(3);
    expect(result.every((r) => r.holiday.type === 'earlyClose')).toBe(true);
  });

  it.each([
    [2025, ['2025-07-03', '2025-11-28', '2025-12-24']],
    [2026, ['2026-07-03', '2026-11-27', '2026-12-24']],
  ])('calculateEarlyCloses(%i) returns exact dates, chronologically sorted', (year, isoDates) => {
    const result = makeCalendar().calculateEarlyCloses(year);
    expect(result).toHaveLength(isoDates.length);
    result.forEach((entry, i) => {
      expect(entry.date.equals(Temporal.PlainDate.from(isoDates[i]))).toBe(true);
    });
    for (let i = 0; i < result.length - 1; i++) {
      expect(Temporal.PlainDate.compare(result[i].date, result[i + 1].date)).toBeLessThanOrEqual(0);
    }
  });

  it.each([DateRolls.previousFridayOrFollowingMonday(), DateRolls.followingMonday()])(
    'never rolls an earlyClose that lands on a weekend day, regardless of dateRoll strategy',
    (dateRoll) => {
      // 2025-07-05 is a Saturday.
      const calendar = new HolidayCalendar({
        code: 'SAT',
        dateRoll,
        holidays: [
          earlyCloseHoliday({
            name: 'Saturday Close',
            observance: makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 5 })),
            ...NY_13,
          }),
        ],
      });

      const [entry] = calendar.calculateEarlyCloses(2025);
      expect(entry.date.equals(Temporal.PlainDate.from('2025-07-05'))).toBe(true);
      expect(calendar.isWeekend(entry.date)).toBe(true);
    },
  );

  it('never rolls an earlyClose even if it carries a stray runtime `rollable` property', () => {
    // earlyCloseHoliday() has no `rollable` option, but excess-property
    // checking only catches fresh object literals — spreading a variable
    // through the factory can still smuggle a `rollable: true` key onto the
    // resulting object at runtime, despite the type declaring no such field.
    const opts = {
      name: 'Saturday Close',
      observance: makeObservance((year: number) => Temporal.PlainDate.from({ year, month: 7, day: 5 })),
      ...NY_13,
      rollable: true,
    };
    const holiday = earlyCloseHoliday(opts) as EarlyCloseHoliday;
    const calendar = new HolidayCalendar({
      code: 'SAT-STRAY-ROLLABLE',
      dateRoll: DateRolls.followingMonday(),
      holidays: [holiday],
    });

    const [entry] = calendar.calculateEarlyCloses(2025);
    expect(entry.date.equals(Temporal.PlainDate.from('2025-07-05'))).toBe(true);
  });

  it('returns [] for a calendar with no earlyClose holidays', () => {
    expect(makeNoEarlyCloseCalendar().calculateEarlyCloses(2025)).toEqual([]);
  });

  it('returns [] for an empty calendar', () => {
    expect(makeEmptyCalendar().calculateEarlyCloses(2025)).toEqual([]);
  });

  it('omits a year the observance excludes rather than throwing', () => {
    const calendar = new HolidayCalendar({
      code: 'GUARDED',
      holidays: [
        earlyCloseHoliday({
          name: 'Early Close',
          observance: makeObservance(
            (year) => Temporal.PlainDate.from({ year, month: 7, day: 3 }),
            (year) => year !== 2026,
          ),
          ...NY_13,
        }),
      ],
    });

    expect(calendar.calculateEarlyCloses(2026)).toEqual([]);
    expect(calendar.calculateEarlyCloses(2025)).toHaveLength(1);
  });

  it('returns array instances distinct from calculate() for the same year', () => {
    const calendar = makeCalendar();
    const closures = calendar.calculate(2025);
    const earlyCloses = calendar.calculateEarlyCloses(2025);
    expect(closures).not.toBe(earlyCloses);
    expect(closures.some((r) => r.holiday.type === 'earlyClose')).toBe(false);
    expect(earlyCloses.some((r) => r.holiday.type !== 'earlyClose')).toBe(false);
  });
});

describe('HolidayCalendar.hasEarlyCloses()', () => {
  it.each([
    ['a mixed calendar', makeCalendar, true],
    ['a calendar with no earlyClose holidays', makeNoEarlyCloseCalendar, false],
    ['an empty calendar', makeEmptyCalendar, false],
  ])('returns %s -> %s', (_label, factory, expected) => {
    expect(factory().hasEarlyCloses()).toBe(expected);
  });

  it('is cheap and year-independent: does not resolve any observance dates', () => {
    const observance = vi.fn((year: number) => Temporal.PlainDate.from({ year, month: 7, day: 3 }));
    const calendar = new HolidayCalendar({
      code: 'SPY',
      holidays: [earlyCloseHoliday({ name: 'Early Close', observance, ...NY_13 })],
    });

    expect(calendar.hasEarlyCloses()).toBe(true);
    expect(observance).not.toHaveBeenCalled();

    calendar.calculateEarlyCloses(2025);
    expect(observance).toHaveBeenCalled();
  });
});

describe('calculate()/calculateRange()/calculateByYear() exclude early closes', () => {
  it.each([2023, 2024, 2025, 2026, 2027])(
    'every holiday for %i appears in exactly one of calculate()/calculateEarlyCloses(), no drops or overlap',
    (year) => {
      const calendar = makeCalendar();
      const closures = calendar.calculate(year);
      const earlyCloses = calendar.calculateEarlyCloses(year);
      const names = (xs: { holiday: { name: string } }[]) => xs.map((x) => x.holiday.name).sort();

      expect(names([...closures, ...earlyCloses])).toEqual(calendar.holidays.map((h) => h.name).sort());
      expect(names(closures).filter((n) => names(earlyCloses).includes(n))).toEqual([]);
    },
  );

  it('calculateRange(y, y) on a calendar with early closes matches calculate(y) and excludes earlyClose', () => {
    const calendar = makeCalendar();
    const result = calendar.calculateRange(2025, 2025);
    expect(result).toEqual(calendar.calculate(2025));
    expect(result.some((r) => r.holiday.type === 'earlyClose')).toBe(false);
  });

  it('calculateByYear() on a calendar with early closes excludes earlyClose from every bucket', () => {
    const calendar = makeCalendar();
    const byYear = calendar.calculateByYear(2025, 2026);
    for (const year of [2025, 2026]) {
      expect(byYear.get(year)).toEqual(calendar.calculate(year));
      expect(byYear.get(year)?.some((r) => r.holiday.type === 'earlyClose')).toBe(false);
    }
  });
});

describe('decided: earlyClose precedence and weekend-landing policy (issue #35)', () => {
  // Formerly an it.todo — resolved by issue #35 (BUILD_SPEC.md §8.5): full
  // closure wins on a same-date collision. See the tests below.

  const sameDate = makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 3 }));

  it.each([
    ['FixedHoliday', fixedHoliday({ name: 'July 3rd Closure', month: 7, day: 3 })],
    ['FloatingHoliday', floatingHoliday({ name: 'July 3rd Closure', observance: sameDate })],
    ['SpecialAnniversary', specialAnniversary({ name: 'July 3rd Closure', date: Temporal.PlainDate.from('2025-07-03') })],
  ])(
    'merge(): a %s colliding with an earlyClose on the same date suppresses the earlyClose (issue #35, decided: full closure wins)',
    (_label, closureHoliday) => {
      const earlyCloseOnly = new HolidayCalendar({
        code: 'EARLY',
        holidays: [earlyCloseHoliday({ name: 'July 3rd Early Close', observance: sameDate, ...NY_13 })],
      });
      const merged = new HolidayCalendar({ code: 'CLOSURES', holidays: [closureHoliday] }).merge(earlyCloseOnly);

      expect(merged.calculate(2025)).toHaveLength(1);
      expect(merged.calculateEarlyCloses(2025)).toHaveLength(0);
    },
  );

  it('suppresses an earlyClose when a rolled full closure lands on the same date (BUILD_SPEC §8.3 example)', () => {
    // Not merge()-specific — suppression applies to any calendar, however
    // its holidays were assembled. 2027-12-25 is a Saturday, so Christmas
    // Day rolls back to 2027-12-24, colliding with the Christmas Eve close.
    const calendar = new HolidayCalendar({
      code: 'XMAS',
      dateRoll: DateRolls.previousFridayOrFollowingMonday(),
      holidays: [
        fixedHoliday({ name: 'Christmas Day', month: 12, day: 25 }),
        earlyCloseHoliday({ name: 'Christmas Eve Early Close', observance: christmasEve, ...NY_13 }),
      ],
    });

    const closures = calendar.calculate(2027);
    const earlyCloses = calendar.calculateEarlyCloses(2027);
    expect(closures).toHaveLength(1);
    expect(closures[0].date.equals(Temporal.PlainDate.from('2027-12-24'))).toBe(true);
    expect(earlyCloses).toHaveLength(0);
  });

  it('does not suppress an earlyClose observance that resolves onto a configured weekend day', () => {
    // 2026-07-04 is a Saturday. Weekend-landing policy is unchanged by
    // issue #35: no core guard, verified at parity with Java.
    const saturday = makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 4 }));
    const calendar = new HolidayCalendar({
      code: 'WEEKEND-EARLY',
      holidays: [earlyCloseHoliday({ name: 'Weekend Early Close', observance: saturday, ...NY_13 })],
    });

    const result = calendar.calculateEarlyCloses(2026);
    expect(result).toHaveLength(1);
    expect(result[0].date.equals(Temporal.PlainDate.from({ year: 2026, month: 7, day: 4 }))).toBe(true);
  });

  it('merge(): unions earlyCloses from two calendars on different, non-colliding dates', () => {
    const julyThird = new HolidayCalendar({
      code: 'JULY',
      holidays: [earlyCloseHoliday({ name: 'July 3rd Early Close', observance: july3, ...NY_13 })],
    });
    const decemberEve = new HolidayCalendar({
      code: 'DEC',
      holidays: [earlyCloseHoliday({ name: 'Christmas Eve Early Close', observance: christmasEve, ...NY_13 })],
    });
    const merged = julyThird.merge(decemberEve);

    const result = merged.calculateEarlyCloses(2025);
    expect(result).toHaveLength(2);
    expect(result[0].date.equals(Temporal.PlainDate.from('2025-07-03'))).toBe(true);
    expect(result[1].date.equals(Temporal.PlainDate.from('2025-12-24'))).toBe(true);
  });

  it('merge(): hasEarlyCloses() becomes true after merging in a calendar with early closes', () => {
    const merged = makeNoEarlyCloseCalendar().merge(
      new HolidayCalendar({
        code: 'EARLY',
        holidays: [earlyCloseHoliday({ name: 'July 3rd Early Close', observance: july3, ...NY_13 })],
      }),
    );
    expect(merged.hasEarlyCloses()).toBe(true);
  });

  it('merge(): hasEarlyCloses() stays true even in a year where the earlyClose is fully suppressed by a collision', () => {
    const closuresOnly = new HolidayCalendar({
      code: 'CLOSURES',
      holidays: [floatingHoliday({ name: 'July 3rd Closure', observance: sameDate })],
    });
    const earlyCloseOnly = new HolidayCalendar({
      code: 'EARLY',
      holidays: [earlyCloseHoliday({ name: 'July 3rd Early Close', observance: sameDate, ...NY_13 })],
    });
    const merged = closuresOnly.merge(earlyCloseOnly);

    expect(merged.calculateEarlyCloses(2025)).toHaveLength(0);
    expect(merged.hasEarlyCloses()).toBe(true);
  });

  it('merge(): dedups an identical earlyClose sharing an Observance reference on both sides (issue #44)', () => {
    const makeSide = () =>
      new HolidayCalendar({
        code: 'SIDE',
        holidays: [earlyCloseHoliday({ name: 'July 3rd Early Close', observance: july3, ...NY_13 })],
      });
    const merged = makeSide().merge(makeSide());

    expect(merged.calculateEarlyCloses(2025)).toHaveLength(1);
  });
});
