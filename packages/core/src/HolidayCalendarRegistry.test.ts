import { describe, expect, it } from 'vitest';
import { HolidayCalendar } from './HolidayCalendar.js';
import { createRegistry, HolidayCalendarRegistry } from './HolidayCalendarRegistry.js';
import type { HolidayCalendarProvider } from './HolidayCalendarRegistry.js';
import { HolidayCalendarNotFoundError } from './HolidayCalendarNotFoundError.js';

const providerFor = (code: string): HolidayCalendarProvider => ({
  code,
  getCalendar: () => new HolidayCalendar({ code, holidays: [] }),
});

describe('HolidayCalendarRegistry — registration and lookup', () => {
  it('registers and retrieves a calendar case-insensitively', () => {
    const registry = new HolidayCalendarRegistry().register(providerFor('US'));
    expect(registry.get('us').code).toBe('US');
    expect(registry.has('Us')).toBe(true);
  });

  it('caches calendars so getCalendar() is only invoked once per code', () => {
    let calls = 0;
    const registry = new HolidayCalendarRegistry().register({
      code: 'US',
      getCalendar: () => {
        calls += 1;
        return new HolidayCalendar({ code: 'US', holidays: [] });
      },
    });
    registry.get('US');
    registry.get('US');
    expect(calls).toBe(1);
  });

  it('throws HolidayCalendarNotFoundError for an unregistered code', () => {
    const registry = new HolidayCalendarRegistry().register(providerFor('US'));
    expect(() => registry.get('FR')).toThrow(HolidayCalendarNotFoundError);
  });
});

describe('HolidayCalendarRegistry.codes() — alphabetical ordering', () => {
  it('returns registered codes sorted alphabetically via localeCompare, not insertion order', () => {
    const registry = createRegistry(providerFor('UK'), providerFor('US'), providerFor('CA'), providerFor('FR'));
    expect(registry.codes()).toEqual(['CA', 'FR', 'UK', 'US']);
  });

  it('returns an empty array for a registry with no providers', () => {
    expect(new HolidayCalendarRegistry().codes()).toEqual([]);
  });
});
