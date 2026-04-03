# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for a single package (by vitest project name)
pnpm test --project core
pnpm test --project western

# Type-check all packages
pnpm typecheck

# Build a single package
pnpm --filter @holiday-calendar/core build
```

Node and pnpm versions are managed by Volta (Node 22.14.0, pnpm 10.6.0).

## Architecture

This is a pnpm workspace monorepo with two packages under `packages/`:

- **`@holiday-calendar/core`** — the abstract API: `Holiday` types, `HolidayCalendar`, `HolidayCalendarRegistry`, `Observance`, and `DateRoll` function types.
- **`@holiday-calendar/western`** — concrete implementations: the US calendar and its observances (Easter, floating US holidays). Other regions will be added here.

This is a TypeScript port of a Java library; comments in source often reference Java equivalents.

### Core domain model

**`Holiday`** is a discriminated union of three types:
- `FixedHoliday` — same month/day every year (e.g. Christmas). Created with `fixedHoliday()`.
- `FloatingHoliday` — date computed by an `Observance` function each year (e.g. Easter). Created with `floatingHoliday()`.
- `SpecialAnniversary` — one-time date, only observed in its specific year. Created with `specialAnniversary()`.

**`Observance`** is `(year: number) => Temporal.PlainDate | null`. Build with `makeObservance()` (adds an optional year guard) or `relativeObservance()` (offset in days from a base observance).

**`DateRoll`** is `(date: Temporal.PlainDate) => Temporal.PlainDate`. Built-in strategies in `DateRolls`: `noRoll()`, `previousFridayOrFollowingMonday()`, `followingMonday()`, and `compose()`.

**`HolidayCalendar`** holds a list of holidays, a `DateRoll`, and a set of weekend day-of-week numbers. `.calculate(year)` returns all `HolidayDate`s for a year, applying rolling to rollable holidays. `.merge(other)` unions two calendars' holidays.

**`HolidayCalendarRegistry`** lazily instantiates and caches calendars from registered `HolidayCalendarProvider`s. Providers are registered explicitly (no ServiceLoader magic) so unused calendars are tree-shaken.

### Adding a new calendar

1. Create observances as `Observance` functions in `packages/western/src/observances/<region>/`.
2. Create a calendar factory and provider in `packages/western/src/calendars/<code>.ts` following the pattern in `us.ts`.
3. Export both from `packages/western/src/index.ts`.

### TypeScript conventions

- `module: NodeNext` — local imports **must** use `.js` extensions (e.g. `import { Foo } from './Foo.js'`).
- All dates use `Temporal.PlainDate` from `@js-temporal/polyfill`, re-exported from `@holiday-calendar/core` so downstream packages don't need a direct dependency on it.