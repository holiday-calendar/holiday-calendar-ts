# Build Spec: reaching functional parity with holiday-calendar-java v2.1.0

This document inventories the gap between this project's current state and
`holiday-calendar-java` v2.1.0, and specifies the target shape to close it.
It is the actionable, TypeScript-specific companion to that project's
[`docs/PORTING_GUIDE.md`](https://github.com/holiday-calendar/holiday-calendar-java/blob/v2.1.0/docs/PORTING_GUIDE.md) —
read the porting guide for *why* a design decision was made; read this
document for *what to build in this repo, in what order*.

Section numbers below intentionally mirror the porting guide's numbering
where a topic corresponds 1:1, to make cross-referencing easy.

## 0. Current state summary

| Area | Java v2.1.0 | This repo, today |
|---|---|---|
| `Holiday` kinds | 4: Fixed, Floating, SpecialAnniversary, EarlyClose | 3: Fixed, Floating, SpecialAnniversary — **no EarlyClose** |
| `HolidayCalendar.calculate` | `calculate(year)`, `calculate(fromYear, toYear)`, `calculateByYear(fromYear, toYear)`, `calculateEarlyCloses(year)`, `hasEarlyCloses()` | only `calculate(year)` |
| `DateRoll` strategies | 6: `noRoll`, `previousFridayOrFollowingMonday`, `followingMonday`, `sundayToMonday`, `followingSunday`, `previousThursdayOrFollowingSunday` | 3: `noRoll`, `previousFridayOrFollowingMonday`, `followingMonday` |
| `merge()` | yes | **yes — already ported**, no gap |
| Plugin mechanism | `ServiceLoader` + `module-info.java` | explicit `HolidayCalendarRegistry.register()` (deliberate, see `CLAUDE.md`) — not a gap, a different-by-design choice |
| National vs. market split | enforced (v2.1.0 fix, §5 below) | **violated** — `US` calendar bundles NYSE-only holidays |
| Regions | western, apac, mena (~30 codes) | western only, 1 code (`US`) |
| `dataValidThrough()` advisory | yes, used by CSV-backed calendars | n/a (no CSV-backed calendars yet) |
| Testing | TestNG, 30-year integration suite per module | Vitest, no integration suite yet |

## 1. Core API gaps (`@holiday-calendar/core`)

These block everything else and should land first.

### 1.1 `EarlyCloseHoliday` — fourth `Holiday` union member

Add to the discriminated union in `packages/core/src/Holiday.ts`:

```ts
interface EarlyCloseHoliday {
  readonly type: 'earlyClose';
  name: string;
  description?: string;
  observance: Observance;
  closeTime: Temporal.PlainTime;
  timeZoneId: string; // IANA zone id, e.g. "America/New_York" — never UTC, never the caller's zone
}
```

- `earlyCloseHoliday(opts)` factory. `rollable` is not a field — early closes
  are never weekend-rolled, full stop (mirrors Java's hardcoded
  `isRollable() === false`).
- `closeTime`/`timeZoneId` are always expressed in the exchange's own local
  time. NYSE's 13:00 `America/New_York` and LSE's 12:30 `Europe/London` on
  the same calendar day are not comparable without first converting through
  the zone — don't normalize to UTC.
- Extend `dateForYear(holiday, year)`'s switch to handle `'earlyClose'`
  (delegates to `holiday.observance(year)`, same as `FloatingHoliday`).

### 1.2 `HolidayCalendar.calculateEarlyCloses()` / `hasEarlyCloses()`

In `packages/core/src/HolidayCalendar.ts`:

```ts
calculate(year: number): HolidayDate[]              // unchanged signature; MUST continue excluding EarlyCloseHoliday
calculateEarlyCloses(year: number): HolidayDate[]    // ONLY EarlyCloseHoliday entries, chronologically sorted, never rolled
hasEarlyCloses(): boolean                            // cheap, year-independent: does this calendar define any EarlyCloseHoliday?
```

This split is the single most important behavioral rule to get right — see
porting guide §1.3. Do not let early closes leak into `calculate()`'s output
under any circumstance.

### 1.3 `calculate(fromYear, toYear)` / `calculateByYear(fromYear, toYear)`

```ts
calculateRange(fromYear: number, toYear: number): HolidayDate[]
  // flattened, chronologically sorted across the whole range

calculateByYear(fromYear: number, toYear: number): Map<number, HolidayDate[]>
  // dense: every year in [fromYear, toYear] present as a key, even if its value is []
```

Naming note: Java overloads `calculate(int, int)` on the same method name as
`calculate(int)`. TypeScript can technically do function overloads too, but
given this project's existing style (explicit method names, no overload
juggling), prefer a distinct name — `calculateRange` — to avoid ambiguity at
call sites. This repo's own `feature_request.yml` issue template already
anticipated a `calculate(fromYear, toYear)`-shaped API; treat that as
confirmation of intent, not a naming mandate to match Java's overload exactly.

### 1.4 Remaining `DateRoll` strategies

Add to `packages/core/src/function/DateRolls.ts`, matching Java's `DateRolls`
exactly:

| Factory | Rule | Used by (target) |
|---|---|---|
| `sundayToMonday()` | Only Sun → following Mon; Sat unchanged | Japan |
| `followingSunday()` | Fri and Sat both → following Sun | GCC markets (SA, AE, KW, BH) |
| `previousThursdayOrFollowingSunday()` | Fri → preceding Thu; Sat → following Sun | Qatar |

`compose()` already exists and needs no change.

### 1.5 `dataValidThrough()` advisory

Add an optional field to `HolidayCalendarProvider`:

```ts
interface HolidayCalendarProvider {
  code: string;
  region?: string;
  getCalendar(): HolidayCalendar;
  dataValidThrough?(): number | undefined; // last year a CSV-backed holiday in this calendar covers
}
```

Advisory only — `calculate()` silently omits a table-backed holiday past this
point rather than throwing. Not needed until a CSV-backed (MENA/APAC)
calendar exists (§5, §6 below); land the field when the first such calendar
does, not speculatively before.

## 2. National vs. market/exchange split (the v2.1.0 fix)

The current `createUSCalendar()` in `packages/western/src/calendars/us.ts`
repeats the exact bug Java fixed in v2.1.0 (porting guide §3.2, §5): it
includes Good Friday and Day-After-Thanksgiving — both NYSE market
conventions, never US federal holidays — directly in the `US` national
calendar, distinguished only by a description string ("NYSE market closure by
convention"), not by structure.

**Target fix:**

1. `US` keeps only genuine federal holidays. Remove Good Friday and
   Day-After-Thanksgiving from `createUSCalendar()`.
2. Add a new `XNYS` market calendar (`packages/western/src/calendars/xnys.ts`)
   for the New York Stock Exchange:
   - `merge()` in the federal `US` holidays (NYSE observes nearly all of
     them) via `usCalendar.merge(...)`, or rebuild the list explicitly —
     whichever keeps the two calendars easiest to audit independently.
   - Add Good Friday and Day-After-Thanksgiving as ordinary `FloatingHoliday`
     entries (NYSE fully closes on both).
   - Add real NYSE `EarlyCloseHoliday` entries once §1.1 lands: July 3rd
     (when July 4th is a weekday), the day after Thanksgiving, and Christmas
     Eve — each 13:00 `America/New_York`, non-rollable, present/absent per
     NYSE's actual published rule (verify current rule via primary source
     before implementing; don't guess from memory). (A colliding full
     closure on the same date suppresses the early close from
     `calculateEarlyCloses()` — see §8.5.)
3. Register `xnysProvider` alongside `usProvider` in
   `packages/western/src/index.ts`.

**Target code-rename table** (mirrors Java's v2.0.0→v2.1.0 fix, porting guide
§5) — use as the naming target if/when each of these calendars is built,
even though only `US`/`XNYS` are in scope for the immediate next step:

| National code (unchanged meaning) | Market/exchange code | Exchange |
|---|---|---|
| `US` | `XNYS` | New York Stock Exchange |
| `CA` | `XTSE` | Toronto Stock Exchange |
| `UK` | `XLON` | London Stock Exchange |
| `AU` | `XASX` | Australian Securities Exchange |
| `FR` | `XPAR` | Euronext Paris |
| `CH` | `XSWX` | SIX Swiss Exchange |
| `DE` | `XETR` | Xetra / Deutsche Börse |
| `SG` | `XSES` | Singapore Exchange |

Note: unlike the other six, Germany and Switzerland had **no pre-existing
national-only calendar before v2.1.0** — `DE` and `CH` didn't exist as codes
at all until Java issues #240 and #239 created them alongside `XETR`/`XSWX`.
Both national calendars now exist and should be ported as such (see §3).

Central-bank/settlement calendars (`USD`, `CAD`, `GBP`, `AUD`, `CHF`, `EUR`,
`SGD`) are a third, separate kind of calendar — settlement-system holidays,
not equities-exchange holidays — and should never be merged into either the
national or the market-exchange calendar for the same country.

## 3. Western module expansion

Target calendars, to reach Java's `holiday-calendar-western` parity, each as
`packages/western/src/calendars/<code>.ts` following the `us.ts`/`xnys.ts`
pattern, with observances grouped by domain under `observances/<domain-or-region>/`
(the existing convention — `observances/christian/`, `observances/us/`, etc.):

- `CA` (national) / `XTSE` (Toronto Stock Exchange) / `CAD` (Bank of Canada)
- `UK` (national) / `XLON` (London Stock Exchange) / `GBP` (CHAPS)
- `CH` (national, "Switzerland National Holidays" — only Swiss National Day,
  Aug 1, is federally mandated; the rest is majority-cantonal convention per
  Java's own javadoc) / `XSWX` (SIX Swiss Exchange) / `CHF` (SIC/SNB)
- `DE` (national, "Germany National Holidays") / `XETR` (Xetra/Deutsche
  Börse) — both `CH` and `DE` national calendars are genuinely new as of
  Java v2.1.0 (issues #239/#240), not pre-existing; verify against live
  Java source rather than assuming either is a stub.
- `FR` (national) / `XPAR` (Euronext Paris) / `EUR` (TARGET2)
- `AU` (national) / `XASX` (Australian Securities Exchange) / `AUD` (RBA)

Each new country's observances that are Easter-derived should reuse the
existing `observances/christian/goodFriday.ts` pattern (built via
`relativeObservance` against `westernEaster`/`orthodoxEaster` in
`observances/easter.ts`) rather than reimplementing Computus per country.

## 4. APAC module (new package: `@holiday-calendar/apac`)

Target calendars: `SG` (national) / `XSES` (Singapore Exchange) / `SGD`
(MAS/MEPS+), `JP` (national — never split; Japan's data is genuinely national
and was not part of Java's v2.1.0 market-split, and it carries no early
closes), `CN` (national) / `CNY` (People's Bank of China).

Needs beyond what western required:

- **Chinese lunisolar calendar** (Chinese New Year): Java uses Time4J's
  `ChineseCalendar`; port using
  [`lunar-javascript`](https://github.com/6tail/lunar-javascript) (the JS
  library the Java porting guide itself recommends for this, porting guide
  §2.4).
- **CSV-backed lookup tables** for Vesak Day, Hari Raya Puasa/Haji, Deepavali
  — same format as Java's (porting guide §2.2, reproduced verbatim below in
  §7), bundled as package resources, parsed once and cached.
- **Japan's cascading substitute-holiday algorithm** (振替休日) plus the
  sandwich-day rule (国民の休日) — the hardest edge case in the whole
  library (porting guide §4.4). Implement as a `HolidayCalendarProvider`
  whose `getCalendar()` returns a `HolidayCalendar` with a custom
  `calculate(year)` override (not a `DateRoll`, since the algorithm needs
  full-year visibility to detect "is this Monday already taken by another
  holiday" — a `DateRoll` only ever sees one date at a time). Cascade
  resolution must run **before** sandwich-day detection, and only
  Sunday-origin substitutes cascade (a Saturday holiday has no substitute at
  all, per the 2007 Holiday Act amendment).

## 5. MENA module (new package: `@holiday-calendar/mena`)

Target calendars: `AE`/`AED`, `SA`/`SAR`, `IL`/`ILS`, `TR`/`TRY`, `QA`/`QAR`,
`EG`/`EGP`, `KW`/`KWD`, `BH`/`BHD`, `MA`/`MAD`, `JO`/`JOD` — ten
national/settlement pairs, all already correctly separated in Java (no
v2.1.0-style split needed here; port the pairing as-is).

Needs:

- **CSV-backed Islamic-calendar lookup tables** (Eid al-Fitr, Eid al-Adha,
  Islamic New Year, Ashura, etc.) — same format/skip-malformed-row rule as
  APAC (§4, §7).
- **Diyanet ilmi takvim astronomical fallback** for years beyond the CSV's
  data ceiling: port using
  [`astronomy-engine`](https://github.com/cosinekitty/astronomy) (the JS
  library the Java porting guide recommends for moon-phase/solar-position
  ephemeris, porting guide §2.4) to replicate Time4J's `MoonPhase`/`SolarTime`
  true-conjunction and Ankara-sunset calculations. Calibrate against every
  published CSV year (2024–2035 in the Java data) before trusting the
  calculator for projected years — never let an algorithmic fallback silently
  override officially-published data for a year the CSV already covers.
- **`IsraelHolidays`-equivalent**: centralize Israel's shared holiday list
  (including early closes — Israel is the other real-world
  `EarlyCloseHoliday` precedent besides NYSE/LSE) in one module consumed by
  both the `IL` and `ILS` calendar builders, rather than duplicating the list.

## 6. Non-Gregorian ephemeris dependency notes

Only APAC (Chinese lunar) and MENA (Islamic, beyond CSV range) need an
ephemeris/lunar-calendar dependency. Western needs none — Easter (Computus)
is pure integer arithmetic (already ported in `observances/easter.ts`) and
all other western observances are Gregorian-calendar rules. Don't add
`lunar-javascript` or `astronomy-engine` as a dependency of `core` or
`western` — scope them to the `apac`/`mena` packages respectively, same
tree-shaking rationale as the existing explicit-registration design (see
CLAUDE.md).

## 7. CSV data format (shared by APAC and MENA)

Reproduce Java's format exactly (porting guide §2.2):

```
year,YYYY-MM-DD[,optional comment]
```

- Blank lines and lines starting with `#` are ignored (used for a header
  comment documenting source tiers — which year range is officially
  published vs. algorithmically projected, and by which authority/algorithm;
  carry this convention forward, it's what lets a future maintainer trust or
  distrust a given date without archaeology).
- Malformed rows (bad year, bad date, fewer than 2 fields) are skipped with a
  warning, not fatal — one bad row must not take down the whole table.
- A single-year lookup returns `Map<year, date>` (last row wins on duplicate
  year); a multi-occurrence lookup (a holiday that can recur more than once
  in a year) returns `Map<year, date[]>`.
- Bundle CSVs as package assets (e.g. under `packages/mena/src/data/`), load
  once at module-init time, and cache — never re-parse per call.

## 8. Testing plan

### 8.1 30-year integration suite (2026–2055)

Per region package, one Vitest suite parametrized (`it.each`/`describe.each`)
over every registered calendar code in that package, asserting (porting guide
§4.1):

1. **Dense range coverage** — `calculateByYear(2026, 2055)` returns exactly
   one entry per year, no missing keys.
2. **Minimum holiday count per year** — a cheap floor (Java uses 5) that
   catches silent data loss (e.g. a broken CSV load returning zero rows)
   without needing an exact expected count per calendar.
3. **No nulls/undefined** — no null/undefined holiday, date, or list entry
   anywhere in a 30-year flat result.
4. **Chronological ordering** — `calculateRange(2026, 2055)` is non-decreasing
   by date throughout. A rolled date can land in the *following* year's
   January (e.g. a Dec 31 holiday rolling to Jan 1) — tolerate this, don't
   treat it as a bug.

Pick 2026–2055 to match this document's own forward-looking data range
(§4, §5); adjust if a specific CSV data source's actual coverage differs.

### 8.2 Per-`Holiday`-kind unit tests

- **Fixed**: assert the date equals the expected `Temporal.PlainDate` for
  several years, including a roll case (the fixed date lands on a weekend).
- **Floating**: assert against known correct historical dates (e.g. Easter
  2026 is April 5; MLK Day 2026 is January 19) rather than re-deriving the
  algorithm in the test.
- **Early close**: assert `rollable` is always effectively `false` (the type
  has no such field — verify it's never rolled by `calculate()`/
  `calculateEarlyCloses()`), and that the `closeTime`/`timeZoneId` pair
  matches expectations, including the "presence correlates with the anchor
  holiday's day-of-week" pattern for suppressed-not-shifted early closes
  (e.g. NYSE/TSX omit an early close entirely some years rather than shifting
  it — re-derive expected presence from the anchor date's day-of-week inside
  the test, don't hand-fixture it per year).

### 8.3 Additional verification checks

- **Timezone consistency for early closes** — assert `timeZoneId` is the
  exchange's own zone, not UTC and not the test runner's local zone.
- **Cross-list date collisions** — a rolled regular holiday can land on the
  same date as an unrelated early close (e.g. Christmas Day rolling back onto
  December 24 in a year where December 25 is a Saturday, colliding with a
  Christmas Eve early close). The full closure wins: assert
  `calculateEarlyCloses()` suppresses the colliding early-close entry for
  that date, while `calculate()`'s full-closure entry is unaffected. See §8.5
  for full policy and rationale (issue #35).
- **`Temporal.PlainDate` equality** — use `.equals()`/
  `Temporal.PlainDate.compare()` in assertions and in library code; never
  `===`/`!==` on `Temporal.Plain*` values (see the
  `region-calendar-issue-plan` skill's engineer prompt for the full
  rationale — this is this project's closest analogue to Java's SonarCloud
  S8696 rule).

### 8.4 Edge cases

- **Leap years** — a `FixedHoliday` on Feb 29: decide explicitly whether
  `dateForYear` returns `null` for non-leap years or throws, and document the
  choice — don't let it be an accident.
- **Year boundaries** — a holiday rolled from Dec 31 to Jan 1 of the next
  year (or vice versa) must sort correctly in a flattened multi-year list,
  and a single-year `calculate(year)` call intentionally can miss a rolled-in
  holiday from the previous year or produce a rolled-out date in the next
  year — document this as intentional per-year-snapshot behavior, not a bug.
- **Japan's cascade** (§4) — verify cascade-before-sandwich ordering with a
  dedicated test, not just incidental coverage from the 30-year suite.

### 8.5 EarlyClose precedence and weekend-landing policy (issue #35)

Two edge cases around `EarlyCloseHoliday` were raised and decided:

- **Same-date collision with a full closure — full closure wins.** When a
  full-closure holiday (`FixedHoliday`/`FloatingHoliday`/`SpecialAnniversary`)
  and an `EarlyCloseHoliday` resolve to the same date within a calendar,
  `calculateEarlyCloses()` suppresses the colliding early-close entry;
  `calculate()`'s full-closure entry is unaffected. Rationale: a full closure
  is the stronger, calendar-level signal that the entire day — including any
  window that would otherwise be a partial trading session — is non-trading.
  Reporting both independently on the same date gives a client contradictory
  information about that day. This matters in practice for merged market
  calendars: merging an `XNYS` calendar (Good Friday modeled as an early
  close) with an `XLON` calendar (Good Friday modeled as a full closure)
  must not report an early close for Good Friday once the merged calendar
  also says it's a full closure that day. Collision is determined by
  comparing `calculate()`'s rolled dates against `calculateEarlyCloses()`'s
  never-rolled dates for the same year — not raw authored dates.
- **Early close landing on a configured weekend day — do nothing.** No core
  guard exists or is planned. Confirmed at parity with
  `holiday-calendar-java`: `HolidayCalendar.calculateEarlyCloses()` in Java
  also never checks `weekendDays`; rolling/weekend logic in both languages is
  gated by `holiday.isRollable()`, and `EarlyCloseHoliday` is hardcoded
  non-rollable in both. Region packages (e.g. the planned `XNYS` calendar in
  §2) are responsible for only encoding early closes on dates that are
  correct against the actual weekend/trading calendar.

## 9. Non-goals / explicitly deferred

- **JPMS `module-info.java` / `ServiceLoader`** — Java-specific; this project
  already made and documented its own choice (explicit
  `HolidayCalendarRegistry.register()` calls, for tree-shaking — see
  CLAUDE.md). Do not introduce a dynamic plugin-discovery mechanism.
- **SonarCloud rule S8696** itself — Java/Sonar-specific tooling. This
  project's actual equivalent risk (`Temporal.Plain*` reference-vs-value
  comparison) is called out in §8.3 and enforced by review, not by a
  configured static-analysis rule, unless/until this project adopts a linter
  rule that can catch it.
- **Maven module structure** — this project's package boundaries are pnpm
  workspace packages (`@holiday-calendar/core`, `@holiday-calendar/western`,
  future `@holiday-calendar/apac`, `@holiday-calendar/mena`), which already
  mirror Java's module boundaries closely enough that no further translation
  is needed.

## 6. CI/CD: npm publishing

Target registry: `https://registry.npmjs.org`, packages published publicly
under the `@holiday-calendar` npm scope.

Rationale: unauthenticated `npm install @holiday-calendar/core` is the npm
ecosystem's default expectation, and GitHub Packages' npm registry would
force every consumer (not just CI) to authenticate — an adoption barrier
this project isn't willing to accept ahead of 1.0.0 GA.

This deliberately diverges from `holiday-calendar-java`'s choice of GitHub
Packages: Maven consumers are already used to configuring extra repositories
in `settings.xml`/`pom.xml`, so that friction is normal in the Java
ecosystem; it is not normal in the npm ecosystem, so the registry choice
here does not mirror Java's 1:1. See issue #36 for the full pipeline design
(snapshot publishes from `develop` via `publish-snapshot.yml`, release
publishes from `main` via `publish-release.yml`).
