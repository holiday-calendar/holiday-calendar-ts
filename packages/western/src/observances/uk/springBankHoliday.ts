import { makeObservance, Temporal } from '@holiday-calendar/core';
import { lastWeekdayOfMonth } from '../utils.js';

const JUBILEE_OVERRIDES: Readonly<Record<number, readonly [number, number]>> = {
  1977: [6, 6],
  2002: [6, 4],
  2012: [6, 4],
  2022: [6, 2],
};

/**
 * Spring Bank Holiday — normally the last Monday of May, from 1971.
 * Moved (not suppressed) to early June in four jubilee years. A separate
 * one-off SpecialAnniversary jubilee holiday also exists in each of those
 * years on a different date — see uk.ts. Value override, not eligibility —
 * see earlyMayBankHoliday.ts for why isValidYear is the wrong tool here.
 */
export const springBankHoliday = makeObservance(
  (year) => {
    const override = JUBILEE_OVERRIDES[year];
    if (override !== undefined) {
      const [month, day] = override;
      return Temporal.PlainDate.from({ year, month, day });
    }
    return lastWeekdayOfMonth(year, 5, 1);
  },
  (year) => year >= 1971,
);
