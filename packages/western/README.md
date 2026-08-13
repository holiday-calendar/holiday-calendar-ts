# @holiday-calendar/western

Western regional holiday calendars for the [Holiday Calendar](https://github.com/holiday-calendar/holiday-calendar-ts)
library. Requires [`@holiday-calendar/core`](https://www.npmjs.com/package/@holiday-calendar/core).

## Supported calendars

| Code | Region |
|------|--------|
| `US` | United States National Holidays |

## Installation

```bash
npm install @holiday-calendar/western @holiday-calendar/core
```

## Usage

```typescript
import { createRegistry } from '@holiday-calendar/core';
import { usProvider } from '@holiday-calendar/western';

const registry = createRegistry(usProvider);
const usCalendar = registry.get('US');

const holidays = usCalendar.calculate(2025);
holidays.forEach(({ date, holiday }) =>
  console.log(`${date}  ${holiday.name}`)
);
```

This package also exports reusable building blocks (`westernEaster`,
`orthodoxEaster`, `goodFriday`, and individual US floating-holiday
observances) for constructing custom western-region calendars.

## Documentation

See the [main repository README](https://github.com/holiday-calendar/holiday-calendar-ts#readme).

## License

[GNU Lesser General Public License, version 2.1](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html)
