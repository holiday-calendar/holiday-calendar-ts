/**
 * Thrown when a requested calendar code is not registered.
 * Equivalent to Java's HolidayCalendarNotFoundException.
 */
export class HolidayCalendarNotFoundError extends Error {
  readonly code: string;
  readonly availableCodes: ReadonlyArray<string>;

  constructor(code: string, availableCodes: ReadonlyArray<string>) {
    const available = availableCodes.length > 0
      ? availableCodes.join(', ')
      : '(none registered)';
    super(`No holiday calendar found for code "${code}". Available: ${available}`);
    this.name = 'HolidayCalendarNotFoundError';
    this.code = code;
    this.availableCodes = availableCodes;
  }
}
