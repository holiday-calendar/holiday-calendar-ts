import { Temporal } from '@js-temporal/polyfill';
import type { DateRoll } from './DateRoll.js';

/**
 * Factory for common DateRoll strategies.
 * Equivalent to Java's DateRolls utility class.
 */
export const DateRolls = {
  /** Returns the date unchanged. */
  noRoll(): DateRoll {
    return (date) => date;
  },

  /**
   * Rolls Saturday to the previous Friday, Sunday to the following Monday.
   * Used by US, AU, CH, DE, FR calendars.
   */
  previousFridayOrFollowingMonday(): DateRoll {
    return (date: Temporal.PlainDate): Temporal.PlainDate => {
      if (date.dayOfWeek === 6) return date.subtract({ days: 1 }); // Sat → Fri
      if (date.dayOfWeek === 7) return date.add({ days: 1 });      // Sun → Mon
      return date;
    };
  },

  /**
   * Rolls both Saturday and Sunday to the following Monday.
   * Used by SG calendar.
   */
  followingMonday(): DateRoll {
    return (date: Temporal.PlainDate): Temporal.PlainDate => {
      if (date.dayOfWeek === 6) return date.add({ days: 2 }); // Sat → Mon
      if (date.dayOfWeek === 7) return date.add({ days: 1 }); // Sun → Mon
      return date;
    };
  },

  /** Composes two DateRolls, applying first then second. */
  compose(first: DateRoll, second: DateRoll): DateRoll {
    return (date: Temporal.PlainDate): Temporal.PlainDate => second(first(date));
  },
} as const;
