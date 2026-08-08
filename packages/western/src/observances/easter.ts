import { Temporal } from '@holiday-calendar/core';
import { makeObservance } from '@holiday-calendar/core';
import type { Observance } from '@holiday-calendar/core';

export const ORTHODOX_MIN_YEAR = 530;
export const ORTHODOX_MAX_YEAR = 3399;

/**
 * Julian-to-Gregorian day offset by century range.
 * Matches Java's OrthodoxEaster.YEAR_RANGE_ADJUSTMENT_MATRIX.
 */
const YEAR_RANGE_ADJUSTMENTS: ReadonlyArray<readonly [number, number, number]> = [
  [1583, 1699, 10],
  [1700, 1799, 11],
  [1800, 1899, 12],
  [1900, 2099, 13],
  [2100, 2199, 14],
  [2200, 2299, 15],
  [2300, 2499, 16],
  [2500, 2599, 17],
  [2600, 2699, 18],
  [2700, 2899, 19],
  [2900, 2999, 20],
  [3000, 3099, 21],
  [3100, 3299, 22],
  [3300, 3399, 23],
] as const;

function gregorianOffset(year: number): number {
  return YEAR_RANGE_ADJUSTMENTS.find(([from, to]) => year >= from && year <= to)?.[2] ?? 0;
}

/**
 * Computes Orthodox Easter using the Gauss algorithm, then converts the
 * resulting Julian date to Gregorian. Valid for years 530–3399 AD.
 */
function computeOrthodoxEaster(year: number): Temporal.PlainDate {
  const a = year % 19;
  const b = year % 4;
  const c = year % 7;

  const d = (19 * a + 16) % 30;
  const e = (2 * b + 4 * c + 6 * d) % 7;
  const h = d + e;

  let day = h + 21;
  let month = 3;
  if (day > 31) {
    day -= 31;
    month = 4;
  }

  // Convert Julian date to Gregorian by adding the century offset
  const julianDate = Temporal.PlainDate.from({ year, month, day });
  return julianDate.add({ days: gregorianOffset(year) });
}

/**
 * Computes Western (Gregorian) Easter using the Butcher/Jones/Meeus algorithm.
 * Years prior to 1583 (before Gregorian calendar adoption) delegate to orthodoxEaster.
 */
function computeWesternEaster(year: number): Temporal.PlainDate {
  if (year < 1583) return computeOrthodoxEaster(year);

  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const dividend = h + l - 7 * m + 114;
  const month = Math.floor(dividend / 31);
  const day = (dividend % 31) + 1;

  return Temporal.PlainDate.from({ year, month, day });
}

/**
 * Orthodox Easter observance (Gauss algorithm, Julian→Gregorian).
 * Valid for years 530–3399.
 */
export const orthodoxEaster: Observance = makeObservance(
  computeOrthodoxEaster,
  (year) => year >= ORTHODOX_MIN_YEAR && year <= ORTHODOX_MAX_YEAR,
);

/**
 * Western (Catholic/Protestant) Easter observance (Butcher/Jones/Meeus algorithm).
 * Valid for years 530+ (pre-1583 uses Orthodox Easter dates).
 */
export const westernEaster: Observance = makeObservance(
  computeWesternEaster,
  (year) => year >= ORTHODOX_MIN_YEAR,
);
