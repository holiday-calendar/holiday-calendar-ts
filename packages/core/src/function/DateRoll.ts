import type { Temporal } from '@js-temporal/polyfill';

/**
 * A function that adjusts a date when it falls on a weekend.
 * Equivalent to Java's DateRoll functional interface.
 */
export type DateRoll = (date: Temporal.PlainDate) => Temporal.PlainDate;
