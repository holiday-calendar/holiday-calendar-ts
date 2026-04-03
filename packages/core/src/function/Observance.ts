import type { Temporal } from '@js-temporal/polyfill';

/**
 * A function that computes the date of a holiday for a given year.
 * Returns null if the holiday does not occur in the given year.
 *
 * Equivalent to Java's Observance functional interface.
 */
export type Observance = (year: number) => Temporal.PlainDate | null;

/**
 * Creates an Observance from a compute function and an optional year guard.
 * Equivalent to Java's AbstractObservance template method pattern.
 */
export function makeObservance(
  compute: (year: number) => Temporal.PlainDate,
  isValidYear?: (year: number) => boolean,
): Observance {
  return (year: number): Temporal.PlainDate | null => {
    if (isValidYear !== undefined && !isValidYear(year)) return null;
    return compute(year);
  };
}

/**
 * Creates an Observance whose date is a fixed offset (in days) from a base Observance.
 * Equivalent to Java's CompositeObservance base class.
 */
export function relativeObservance(base: Observance, offsetDays: number): Observance {
  return (year: number): Temporal.PlainDate | null => {
    const baseDate = base(year);
    if (baseDate === null) return null;
    return baseDate.add({ days: offsetDays });
  };
}
