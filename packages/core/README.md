# @holiday-calendar/core

The core API for the [Holiday Calendar](https://github.com/holiday-calendar/holiday-calendar-ts)
library — types and building blocks for defining and calculating holiday
calendars. Has no built-in calendars; pair it with a regional package such as
[`@holiday-calendar/western`](https://www.npmjs.com/package/@holiday-calendar/western)
or implement your own `HolidayCalendarProvider`.

## What's included

- `Holiday` — a discriminated union of `FixedHoliday`, `FloatingHoliday`, and
  `SpecialAnniversary`, built via `fixedHoliday()`, `floatingHoliday()`, and
  `specialAnniversary()`.
- `HolidayCalendar` — holds holidays, a date-rolling strategy, and weekend
  days; `.calculate(year)` returns observed dates, `.merge(other)` combines
  two calendars.
- `HolidayCalendarRegistry` — lazily instantiates and caches calendars from
  explicitly registered `HolidayCalendarProvider`s.
- `Observance` — `(year: number) => Temporal.PlainDate | null`.
- `DateRoll` / `DateRolls` — weekend-rolling strategies (`noRoll`,
  `followingMonday`, `previousFridayOrFollowingMonday`, `compose`).
- `Temporal` — re-exported from `@js-temporal/polyfill`.

## Installation

```bash
npm install @holiday-calendar/core
```

## Usage

```typescript
import {
  HolidayCalendar,
  HolidayCalendarProvider,
  DateRolls,
  fixedHoliday,
  createRegistry,
} from '@holiday-calendar/core';

const xxProvider: HolidayCalendarProvider = {
  code: 'XX',
  region: 'Example National Holidays',
  getCalendar(): HolidayCalendar {
    return new HolidayCalendar({
      code: 'XX',
      name: 'Example National Holidays',
      dateRoll: DateRolls.followingMonday(),
      holidays: [
        fixedHoliday({ name: "New Year's Day", month: 1, day: 1 }),
      ],
    });
  },
};

const registry = createRegistry(xxProvider);
const holidays2025 = registry.get('XX').calculate(2025);
```

For ready-made national calendars, see
[`@holiday-calendar/western`](https://www.npmjs.com/package/@holiday-calendar/western).

## Documentation

See the [main repository README](https://github.com/holiday-calendar/holiday-calendar-ts#readme).

## License

[GNU Lesser General Public License, version 2.1](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html)
