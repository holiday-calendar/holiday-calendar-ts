// Re-export Temporal so downstream packages only need @holiday-calendar/core as a dep
export { Temporal } from '@js-temporal/polyfill';

export type { Holiday, FixedHoliday, FloatingHoliday, SpecialAnniversary, EarlyCloseHoliday } from './Holiday.js';
export {
  fixedHoliday,
  floatingHoliday,
  specialAnniversary,
  earlyCloseHoliday,
  dateForYear,
} from './Holiday.js';

export type { HolidayDate } from './HolidayDate.js';

export { HolidayCalendar, STANDARD_WEEKEND } from './HolidayCalendar.js';
export type { HolidayCalendarConfig } from './HolidayCalendar.js';

export { HolidayCalendarNotFoundError } from './HolidayCalendarNotFoundError.js';
export { InvalidYearRangeError } from './InvalidYearRangeError.js';

export { HolidayCalendarRegistry, createRegistry } from './HolidayCalendarRegistry.js';
export type { HolidayCalendarProvider } from './HolidayCalendarRegistry.js';

export type { Observance } from './function/Observance.js';
export { makeObservance, relativeObservance } from './function/Observance.js';

export type { DateRoll } from './function/DateRoll.js';
export { DateRolls } from './function/DateRolls.js';
