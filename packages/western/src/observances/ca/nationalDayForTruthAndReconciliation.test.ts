import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import { nationalDayForTruthAndReconciliation } from './nationalDayForTruthAndReconciliation.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('nationalDayForTruthAndReconciliation', () => {
  it.each([
    [2021, '2021-09-30'],
    [2022, '2022-09-30'],
    [2023, '2023-09-30'],
    [2024, '2024-09-30'],
  ])('%i -> %s (unrolled observance date)', (year, expected) => {
    expect(nationalDayForTruthAndReconciliation(year)?.equals(d(expected))).toBe(true);
  });

  it('returns null for years before 2021', () => {
    expect(nationalDayForTruthAndReconciliation(2020)).toBeNull();
  });
});
