import { Temporal, makeObservance } from '@holiday-calendar/core';

// isValidYear here encodes a legislative-enactment cutoff (federal statute,
// first observed 2021), not algorithm validity — a different use of the
// hook than westernEaster's pre-1583 Gregorian-calendar guard. Modeled as a
// floatingHoliday wrapping a fixed date, rather than a fixedHoliday, because
// fixedHoliday() has no year-validity option in this codebase.
export const nationalDayForTruthAndReconciliation = makeObservance(
  (year) => Temporal.PlainDate.from({ year, month: 9, day: 30 }),
  (year) => year >= 2021,
);
