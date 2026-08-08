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

  /**
   * Only Sunday rolls forward to the following Monday; Saturday is returned
   * unchanged (no substitute observance).
   *
   * Implements the Japanese substitute-holiday rule (振替休日): a make-up
   * Monday is created only when a national holiday falls on Sunday. A
   * Saturday holiday has no substitute — it falls on an already-closed day
   * and is returned at its natural date.
   */
  sundayToMonday(): DateRoll {
    return (date: Temporal.PlainDate): Temporal.PlainDate => {
      if (date.dayOfWeek === 7) return date.add({ days: 1 }); // Sun → Mon
      return date;
    };
  },

  /**
   * Friday and Saturday both roll forward to Sunday.
   *
   * Implements the GCC market rule (Saudi Arabia, UAE, Kuwait, Bahrain,
   * Oman): the weekend is Friday + Saturday, and Sunday is the first
   * business day of the week.
   */
  followingSunday(): DateRoll {
    return (date: Temporal.PlainDate): Temporal.PlainDate => {
      if (date.dayOfWeek === 5) return date.add({ days: 2 }); // Fri → Sun
      if (date.dayOfWeek === 6) return date.add({ days: 1 }); // Sat → Sun
      return date;
    };
  },

  /**
   * Friday rolls back to Thursday; Saturday rolls forward to Sunday.
   *
   * Implements the Qatar national holiday substitute rule as announced by
   * the Amiri Diwan: a holiday falling on Friday (the first weekend day) is
   * observed on the preceding Thursday; one falling on Saturday (the second
   * weekend day) is observed on the following Sunday.
   */
  previousThursdayOrFollowingSunday(): DateRoll {
    return (date: Temporal.PlainDate): Temporal.PlainDate => {
      if (date.dayOfWeek === 5) return date.subtract({ days: 1 }); // Fri → Thu
      if (date.dayOfWeek === 6) return date.add({ days: 1 });      // Sat → Sun
      return date;
    };
  },

  /** Composes two DateRolls, applying first then second. */
  compose(first: DateRoll, second: DateRoll): DateRoll {
    return (date: Temporal.PlainDate): Temporal.PlainDate => second(first(date));
  },
} as const;
