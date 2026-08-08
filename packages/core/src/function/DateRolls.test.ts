import { describe, it, expect } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { DateRolls } from './DateRolls.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('DateRolls.noRoll', () => {
  const roll = DateRolls.noRoll();

  it.each(['2024-01-01', '2024-01-06', '2024-01-07'])('%s is returned unchanged', (input) => {
    expect(roll(d(input)).toString()).toBe(input);
  });
});

describe('DateRolls.previousFridayOrFollowingMonday', () => {
  const roll = DateRolls.previousFridayOrFollowingMonday();

  it.each([
    ['2024-01-01', '2024-01-01'], // Mon - no-op
    ['2024-01-02', '2024-01-02'], // Tue - no-op
    ['2024-01-03', '2024-01-03'], // Wed - no-op
    ['2024-01-04', '2024-01-04'], // Thu - no-op
    ['2024-01-05', '2024-01-05'], // Fri - no-op
    ['2024-01-06', '2024-01-05'], // Sat -> preceding Fri
    ['2024-01-07', '2024-01-08'], // Sun -> following Mon
  ])('%s -> %s', (input, expected) => {
    expect(roll(d(input)).toString()).toBe(expected);
  });

  it('rolls a boundary Saturday backward into December of the previous year', () => {
    // 2022-01-01 is a Saturday
    expect(roll(d('2022-01-01')).toString()).toBe('2021-12-31');
  });
});

describe('DateRolls.followingMonday', () => {
  const roll = DateRolls.followingMonday();

  it.each([
    ['2024-01-01', '2024-01-01'], // Mon - no-op
    ['2024-01-02', '2024-01-02'], // Tue - no-op
    ['2024-01-03', '2024-01-03'], // Wed - no-op
    ['2024-01-04', '2024-01-04'], // Thu - no-op
    ['2024-01-05', '2024-01-05'], // Fri - no-op
    ['2024-01-06', '2024-01-08'], // Sat -> following Mon
    ['2024-01-07', '2024-01-08'], // Sun -> following Mon
  ])('%s -> %s', (input, expected) => {
    expect(roll(d(input)).toString()).toBe(expected);
  });

  it('rolls a boundary Saturday forward into January of the next year', () => {
    // 2022-12-31 is a Saturday
    expect(roll(d('2022-12-31')).toString()).toBe('2023-01-02');
  });
});

describe('DateRolls.sundayToMonday', () => {
  const roll = DateRolls.sundayToMonday();

  it.each([
    ['2024-01-01', '2024-01-01'], // Mon - no-op
    ['2024-01-02', '2024-01-02'], // Tue - no-op
    ['2024-01-03', '2024-01-03'], // Wed - no-op
    ['2024-01-04', '2024-01-04'], // Thu - no-op
    ['2024-01-05', '2024-01-05'], // Fri - no-op
    ['2024-01-06', '2024-01-06'], // Sat - no-op (unchanged, no substitute)
    ['2024-01-07', '2024-01-08'], // Sun -> following Mon
  ])('%s -> %s', (input, expected) => {
    expect(roll(d(input)).toString()).toBe(expected);
  });

  it('rolls a year-boundary Sunday into January of the next year', () => {
    // 2023-12-31 is a Sunday
    expect(roll(d('2023-12-31')).toString()).toBe('2024-01-01');
  });
});

describe('DateRolls.followingSunday', () => {
  const roll = DateRolls.followingSunday();

  it.each([
    ['2024-01-01', '2024-01-01'], // Mon - no-op
    ['2024-01-02', '2024-01-02'], // Tue - no-op
    ['2024-01-03', '2024-01-03'], // Wed - no-op
    ['2024-01-04', '2024-01-04'], // Thu - no-op
    ['2024-01-05', '2024-01-07'], // Fri -> following Sun
    ['2024-01-06', '2024-01-07'], // Sat -> following Sun
    ['2024-01-07', '2024-01-07'], // Sun - no-op (already Sunday)
  ])('%s -> %s', (input, expected) => {
    expect(roll(d(input)).toString()).toBe(expected);
  });

  it('rolls a boundary Saturday into January of the next year', () => {
    // 2022-12-31 is a Saturday
    expect(roll(d('2022-12-31')).toString()).toBe('2023-01-01');
  });

  it('rolls a boundary Friday two days forward into January of the next year', () => {
    // 2022-12-30 is a Friday
    expect(roll(d('2022-12-30')).toString()).toBe('2023-01-01');
  });
});

describe('DateRolls.previousThursdayOrFollowingSunday', () => {
  const roll = DateRolls.previousThursdayOrFollowingSunday();

  it.each([
    ['2024-01-01', '2024-01-01'], // Mon - no-op
    ['2024-01-02', '2024-01-02'], // Tue - no-op
    ['2024-01-03', '2024-01-03'], // Wed - no-op
    ['2024-01-04', '2024-01-04'], // Thu - no-op
    ['2024-01-05', '2024-01-04'], // Fri -> preceding Thu
    ['2024-01-06', '2024-01-07'], // Sat -> following Sun
    ['2024-01-07', '2024-01-07'], // Sun - no-op
  ])('%s -> %s', (input, expected) => {
    expect(roll(d(input)).toString()).toBe(expected);
  });

  it('rolls a boundary Friday backward into December of the previous year', () => {
    // 2021-01-01 is a Friday
    expect(roll(d('2021-01-01')).toString()).toBe('2020-12-31');
  });

  it('rolls a boundary Saturday forward into January of the next year', () => {
    // 2022-12-31 is a Saturday
    expect(roll(d('2022-12-31')).toString()).toBe('2023-01-01');
  });
});

describe('DateRolls.compose', () => {
  it('applies the first roll then the second roll', () => {
    const composed = DateRolls.compose(
      DateRolls.sundayToMonday(),
      DateRolls.followingSunday(),
    );

    expect(composed(d('2024-01-06')).toString()).toBe('2024-01-07'); // Sat -> (unchanged) -> following Sun
    expect(composed(d('2024-01-07')).toString()).toBe('2024-01-08'); // Sun -> Mon -> (unchanged)
    expect(composed(d('2024-01-05')).toString()).toBe('2024-01-07'); // Fri -> (unchanged) -> following Sun
  });

  it('is not commutative when the two rolls interact', () => {
    const AB = DateRolls.compose(DateRolls.sundayToMonday(), DateRolls.followingSunday());
    const BA = DateRolls.compose(DateRolls.followingSunday(), DateRolls.sundayToMonday());

    // AB: sundayToMonday(Fri) = Fri (unchanged), followingSunday(Fri) = next Sun
    // BA: followingSunday(Fri) = next Sun, sundayToMonday(Sun) = next Mon
    expect(AB(d('2024-01-05')).toString()).toBe('2024-01-07');
    expect(BA(d('2024-01-05')).toString()).toBe('2024-01-08');
  });
});
