# DE — Germany National Holidays

- **Standard:** ISO 3166-1 alpha-2 `DE`
- **Category:** National
- **Sibling calendars:** `XETR` (Deutsche Börse Xetra) is planned but not yet
  implemented in this repo (see `docs/BUILD_SPEC.md` §2/§3). Upstream Java
  shares all 9 holidays below between `DE` and `XETR` via a common
  `DeHolidays` factory; `XETR` additionally adds Christmas Eve and New Year's
  Eve as market-only closures.
- **Implementation:** `createDECalendar()` / `deProvider`
  (`packages/western/src/calendars/de.ts`)

## Weekend & Date Roll

- **Weekend days:** Saturday + Sunday
- **Roll strategy:** `DateRolls.noRoll()` — **deliberately differs from
  upstream Java**, which uses `previousFridayOrFollowingMonday()` with the 5
  fixed holidays `rollable(true)`. Germany observes no substitute holiday
  when a public holiday falls on a weekend, so every fixed holiday stays on
  its calendar date, Saturday or Sunday included. See Notes of Interest and
  `docs/BUILD_SPEC.md` §2.3 (issue #55).
- **Rollability exceptions:** None — all 9 holidays are `rollable: false`.
  The four floating holidays (Good Friday, Easter Monday, Ascension Day,
  Whit Monday) are weekday-anchored; the 5 fixed holidays are non-rollable by
  design (see above).

## Holidays

| Name | Type | Rollable | Notes |
|------|------|----------|-------|
| New Year's Day | Fixed | No | January 1 |
| Good Friday | Floating | No | Friday before Western Easter Sunday |
| Easter Monday | Floating | No | Day after Western Easter Sunday |
| Labour Day | Fixed | No | May 1 |
| Ascension Day | Floating | No | 39 days after Easter Sunday |
| Whit Monday | Floating | No | Day after Whit Sunday (Pentecost) |
| German Unity Day | Fixed | No | October 3 |
| Christmas Day | Fixed | No | December 25 |
| Boxing Day | Fixed | No | December 26 |

These are exactly Germany's 9 nationwide (bundesweite) public holidays — no
regional/state (Länder) holidays are included.

## Early Closes

Not applicable — the `DE` national calendar never includes early-close
(half-day) sessions. Xetra's Christmas Eve/New Year's Eve closures are
market-only and belong on the (not yet implemented) `XETR` calendar.

## Notes of Interest

**No weekend roll is an intentional deviation from Java, not a gap.**
Upstream `HolidayCalendarServiceDE` rolls weekend fixed holidays to the
previous Friday or following Monday. This codebase does not, because German
practice grants no substitute day when a public holiday falls on a weekend.
For example, German Unity Day 2021 (Sunday October 3) had no Monday-in-lieu,
and in 2026 Boxing Day (Saturday December 26) stays on that date rather than
colliding with Christmas Day. Do not "restore parity" by re-adding the roll;
the Java behavior should be reported upstream instead (see
`docs/BUILD_SPEC.md` §2.3).

**Länder (state) holidays are not modeled.** Germany observes additional
public holidays at the individual state level (e.g. Epiphany, Corpus Christi,
Reformation Day, All Saints' Day — each recognized in only some states). `DE`
models only the 9 holidays observed nationwide, consistent with this
project's general pattern of a single canonical national list (see also `CH`
and `AU` for similar simplifications).

**Easter-based dates use Western (Gregorian) Easter** via `westernEaster`.

## Sources

- The no-roll rationale cites Wikipedia (Tag der Deutschen Einheit), the
  German Federal Ministry of the Interior (BMI) national holidays page, and
  general German labor-law sources, as listed in issue #55. They were carried
  over from that issue and not independently re-verified when writing this
  page.
- The 9-holiday list is taken from upstream `holiday-calendar-java`'s
  `docs/calendars/DE.md`, which notes that no single official federal page
  enumerating exactly these nationwide holidays was captured with a stable
  citation; it was not independently verified here.
