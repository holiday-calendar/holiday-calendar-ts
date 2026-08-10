/**
 * Thrown when a year range is invalid, i.e. fromYear > toYear.
 */
export class InvalidYearRangeError extends Error {
  readonly fromYear: number;
  readonly toYear: number;

  constructor(fromYear: number, toYear: number) {
    super(`fromYear (${fromYear}) must not be greater than toYear (${toYear})`);
    this.name = 'InvalidYearRangeError';
    this.fromYear = fromYear;
    this.toYear = toYear;
  }
}
