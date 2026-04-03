import type { Temporal } from '@js-temporal/polyfill';
import type { Holiday } from './Holiday.js';

/**
 * A pairing of a Holiday with its resolved date for a specific year.
 * Equivalent to Java's HolidayDate record.
 */
export interface HolidayDate {
  readonly holiday: Holiday;
  readonly date: Temporal.PlainDate;
}
