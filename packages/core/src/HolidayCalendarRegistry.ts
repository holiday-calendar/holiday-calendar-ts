import type { HolidayCalendar } from './HolidayCalendar.js';
import { HolidayCalendarNotFoundError } from './HolidayCalendarNotFoundError.js';

/**
 * A calendar provider that can supply a HolidayCalendar on demand.
 * Equivalent to Java's HolidayCalendarService interface.
 *
 * Unlike Java's ServiceLoader, providers are registered explicitly —
 * import what you need and register it. This enables tree-shaking.
 */
export interface HolidayCalendarProvider {
  readonly code: string;
  readonly region?: string;
  getCalendar(): HolidayCalendar;
}

/**
 * A registry of HolidayCalendarProviders, with lazy instantiation and caching.
 * Equivalent to Java's HolidayCalendarFactory.
 *
 * Usage:
 *   import { createRegistry } from '@holiday-calendar/core';
 *   import { usProvider } from '@holiday-calendar/western';
 *   const registry = createRegistry(usProvider);
 *   const cal = registry.get('US');
 */
export class HolidayCalendarRegistry {
  private readonly providers = new Map<string, HolidayCalendarProvider>();
  private readonly cache = new Map<string, HolidayCalendar>();

  /** Registers a provider. Returns this for chaining. */
  register(provider: HolidayCalendarProvider): this {
    this.providers.set(provider.code.toUpperCase(), provider);
    return this;
  }

  /**
   * Returns the HolidayCalendar for the given code (case-insensitive).
   * Calendars are instantiated once and cached.
   * Throws HolidayCalendarNotFoundError if not registered.
   */
  get(code: string): HolidayCalendar {
    const key = code.toUpperCase();
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;

    const provider = this.providers.get(key);
    if (provider === undefined) {
      throw new HolidayCalendarNotFoundError(code, this.codes());
    }

    const calendar = provider.getCalendar();
    this.cache.set(key, calendar);
    return calendar;
  }

  /** Returns true if a provider for the given code is registered. */
  has(code: string): boolean {
    return this.providers.has(code.toUpperCase());
  }

  /** Returns all registered codes in alphabetical order. */
  codes(): string[] {
    return [...this.providers.keys()].sort((a, b) => a.localeCompare(b));
  }
}

/**
 * Convenience factory: creates a registry pre-loaded with the given providers.
 *
 * @example
 * const registry = createRegistry(usProvider, ukProvider);
 * const cal = registry.get('US');
 */
export function createRegistry(
  ...providers: HolidayCalendarProvider[]
): HolidayCalendarRegistry {
  const registry = new HolidayCalendarRegistry();
  for (const provider of providers) {
    registry.register(provider);
  }
  return registry;
}
