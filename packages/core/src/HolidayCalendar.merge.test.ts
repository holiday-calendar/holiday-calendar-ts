import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, it } from 'vitest';
import { fixedHoliday } from './Holiday.js';
import { makeObservance } from './function/Observance.js';
import { DateRolls } from './function/DateRolls.js';
import type { DateRoll } from './function/DateRoll.js';
import { HolidayCalendar } from './HolidayCalendar.js';

describe('HolidayCalendar.merge() — code/name composition', () => {
  it('concatenates codes as "this/other"', () => {
    const a = new HolidayCalendar({ code: 'US', holidays: [] });
    const b = new HolidayCalendar({ code: 'XNYS', holidays: [] });
    expect(a.merge(b).code).toBe('US/XNYS');
  });

  it('concatenates explicit names as "this + other"', () => {
    const a = new HolidayCalendar({ code: 'US', name: 'United States', holidays: [] });
    const b = new HolidayCalendar({ code: 'XNYS', name: 'NYSE', holidays: [] });
    expect(a.merge(b).name).toBe('United States + NYSE');
  });

  it('composes from the resolved name (defaulted to code) when a side has no explicit name', () => {
    const a = new HolidayCalendar({ code: 'US', holidays: [] });
    const b = new HolidayCalendar({ code: 'XNYS', holidays: [] });
    expect(a.merge(b).name).toBe('US + XNYS');
  });
});

describe('HolidayCalendar.merge() — dateRoll composition', () => {
  // Both rolls only fire on Saturday, so the net result reveals which one was
  // applied last/outermost.
  const rollA: DateRoll = (date) => (date.dayOfWeek === 6 ? date.add({ days: 3 }) : date);
  const rollB: DateRoll = (date) => (date.dayOfWeek === 6 ? date.add({ days: 1 }) : date);

  it("applies other's roll first, then this one's (this outermost)", () => {
    const a = new HolidayCalendar({ code: 'A', dateRoll: rollA, holidays: [] });
    const b = new HolidayCalendar({ code: 'B', dateRoll: rollB, holidays: [] });

    const saturday = Temporal.PlainDate.from('2025-07-05'); // Saturday
    const merged = a.merge(b).dateRoll(saturday);

    // b fires first (+1 day -> Sunday); a then sees Sunday and no-ops.
    expect(merged.equals(Temporal.PlainDate.from('2025-07-06'))).toBe(true);
  });

  it('does not drop the non-default side when the other side uses noRoll()', () => {
    const a = new HolidayCalendar({ code: 'A', dateRoll: rollA, holidays: [] });
    const b = new HolidayCalendar({ code: 'B', dateRoll: DateRolls.noRoll(), holidays: [] });

    const saturday = Temporal.PlainDate.from('2025-07-05');
    expect(a.merge(b).dateRoll(saturday).equals(Temporal.PlainDate.from('2025-07-08'))).toBe(true);
  });
});

describe('HolidayCalendar.merge() — weekendDays union', () => {
  it('unions disjoint weekend day sets', () => {
    const a = new HolidayCalendar({ code: 'A', holidays: [] }); // default {6,7}
    const b = new HolidayCalendar({ code: 'B', weekendDays: [5], holidays: [] });
    const merged = a.merge(b);

    expect(merged.isWeekend(Temporal.PlainDate.from('2025-07-04'))).toBe(true); // Friday
    expect(merged.isWeekend(Temporal.PlainDate.from('2025-07-05'))).toBe(true); // Saturday
    expect(merged.isWeekend(Temporal.PlainDate.from('2025-07-06'))).toBe(true); // Sunday
    expect(merged.weekendDays.size).toBe(3);
  });

  it('unions overlapping weekend day sets without duplication', () => {
    const a = new HolidayCalendar({ code: 'A', holidays: [] });
    const b = new HolidayCalendar({ code: 'B', holidays: [] });
    expect(a.merge(b).weekendDays.size).toBe(2);
  });
});

describe('HolidayCalendar.merge() — holiday dedup', () => {
  it('dedups a structurally identical FixedHoliday defined on both sides', () => {
    const holidayA = fixedHoliday({ name: 'Independence Day', month: 7, day: 4 });
    const holidayB = fixedHoliday({ name: 'Independence Day', month: 7, day: 4 });
    const a = new HolidayCalendar({ code: 'A', holidays: [holidayA] });
    const b = new HolidayCalendar({ code: 'B', holidays: [holidayB] });

    expect(a.merge(b).calculate(2025)).toHaveLength(1);
  });

  it('keeps distinct holidays from both sides', () => {
    const a = new HolidayCalendar({
      code: 'A',
      holidays: [fixedHoliday({ name: "New Year's Day", month: 1, day: 1 })],
    });
    const b = new HolidayCalendar({
      code: 'B',
      holidays: [fixedHoliday({ name: 'Independence Day', month: 7, day: 4 })],
    });

    expect(a.merge(b).calculate(2025)).toHaveLength(2);
  });

  it('dedups only the shared holiday in a mixed set, keeping the unique ones from each side', () => {
    const shared = fixedHoliday({ name: 'Independence Day', month: 7, day: 4 });
    const a = new HolidayCalendar({
      code: 'A',
      holidays: [fixedHoliday({ name: "New Year's Day", month: 1, day: 1 }), shared],
    });
    const b = new HolidayCalendar({
      code: 'B',
      holidays: [shared, fixedHoliday({ name: 'Veterans Day', month: 11, day: 11 })],
    });

    expect(a.merge(b).calculate(2025)).toHaveLength(3);
  });

  it('does not dedup two FloatingHolidays with independently-defined, logically-identical observances', () => {
    // Documents expected/acceptable parity with Java: a lambda field compares
    // by reference there too, so only a *shared* Observance reference dedups.
    const observanceA = makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 4 }));
    const observanceB = makeObservance((year) => Temporal.PlainDate.from({ year, month: 7, day: 4 }));
    const a = new HolidayCalendar({
      code: 'A',
      holidays: [{ type: 'floating', name: 'Independence Day', observance: observanceA, rollable: true }],
    });
    const b = new HolidayCalendar({
      code: 'B',
      holidays: [{ type: 'floating', name: 'Independence Day', observance: observanceB, rollable: true }],
    });

    expect(a.merge(b).calculate(2025)).toHaveLength(2);
  });
});

describe('HolidayCalendar.merge() — empty holiday lists', () => {
  it('merging an empty calendar into a populated one keeps the populated side unchanged', () => {
    const empty = new HolidayCalendar({ code: 'EMPTY', holidays: [] });
    const populated = new HolidayCalendar({
      code: 'US',
      holidays: [fixedHoliday({ name: "New Year's Day", month: 1, day: 1 })],
    });

    expect(empty.merge(populated).calculate(2025)).toHaveLength(1);
    expect(populated.merge(empty).calculate(2025)).toHaveLength(1);
  });

  it('merging two empty calendars produces an empty calendar', () => {
    const a = new HolidayCalendar({ code: 'A', holidays: [] });
    const b = new HolidayCalendar({ code: 'B', holidays: [] });
    expect(a.merge(b).calculate(2025)).toEqual([]);
  });
});
