import { describe, it, expect } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { makeObservance, relativeObservance } from './Observance.js';
import type { Observance } from './Observance.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

describe('makeObservance', () => {
  it('delegates to compute when no year guard is given', () => {
    const observance = makeObservance((year) => d(`${year}-01-01`));
    expect(observance(2024)?.equals(d('2024-01-01'))).toBe(true);
  });

  it('returns null when the year guard rejects the year', () => {
    const observance = makeObservance(
      (year) => d(`${year}-01-01`),
      (year) => year >= 2000,
    );
    expect(observance(1999)).toBeNull();
    expect(observance(2000)?.equals(d('2000-01-01'))).toBe(true);
  });
});

describe('relativeObservance', () => {
  it('adds a positive offset to the base observance date', () => {
    const base: Observance = (year) => (year === 2024 ? d('2024-06-15') : null);
    const observance = relativeObservance(base, 10);
    expect(observance(2024)?.equals(d('2024-06-25'))).toBe(true);
  });

  it('adds a negative offset to the base observance date', () => {
    const base: Observance = (year) => (year === 2024 ? d('2024-06-15') : null);
    const observance = relativeObservance(base, -10);
    expect(observance(2024)?.equals(d('2024-06-05'))).toBe(true);
  });

  it('propagates null from the base observance', () => {
    const base: Observance = () => null;
    const observance = relativeObservance(base, 5);
    expect(observance(2024)).toBeNull();
  });
});
