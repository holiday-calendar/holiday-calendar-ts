# FR — France National Holidays

- **Standard:** ISO 3166-1 alpha-2 `FR`
- **Category:** National
- **Sibling calendars:** `XPAR` (Euronext Paris) and `EUR` (TARGET2) are
  planned but not yet implemented in this repo (see `docs/BUILD_SPEC.md`
  §2/§3). Upstream Java shares all 11 holidays below between `FR` and
  `XPAR` via a common `FrHolidays` factory; `XPAR` additionally adds Good
  Friday (a market-only convention, not a French national holiday) plus two
  early closes.
- **Implementation:** `createFRCalendar()` / `frProvider`
  (`packages/western/src/calendars/fr.ts`)

## Weekend & Date Roll

- **Weekend days:** Saturday + Sunday
- **Roll strategy:** `DateRolls.noRoll()` — **deliberately differs from
  upstream Java**, which uses `previousFridayOrFollowingMonday()` with the 8
  fixed holidays `rollable(true)`. France grants no statutory substitute
  holiday when a public holiday falls on a weekly rest day, so every fixed
  holiday stays on its calendar date, Saturday or Sunday included. See Notes
  of Interest and `docs/BUILD_SPEC.md` §2.2 (issue #57).
- **Rollability exceptions:** None — all 11 holidays are `rollable: false`.
  The three floating holidays (Easter Monday, Ascension Day, Whit Monday)
  are weekday-anchored; the 8 fixed holidays are non-rollable by design
  (see above).

## Holidays

| Name | Type | Rollable | Notes |
|------|------|----------|-------|
| New Year's Day | Fixed | No | January 1 |
| Easter Monday | Floating | No | Day after Western Easter Sunday |
| Labour Day | Fixed | No | May 1 |
| Victory in Europe Day | Fixed | No | May 8 |
| Ascension Day | Floating | No | 39 days after Easter Sunday |
| Whit Monday | Floating | No | Day after Whit Sunday (Pentecost) |
| Bastille Day | Fixed | No | July 14; French National Day |
| Assumption Day | Fixed | No | August 15 |
| All Saints' Day | Fixed | No | November 1 |
| Armistice Day | Fixed | No | November 11 |
| Christmas Day | Fixed | No | December 25 |

Good Friday is **not** included — it is not a French national holiday
(unlike its inclusion on the planned `XPAR` calendar, where it is a
market-only convention).

## Early Closes

Not applicable — the `FR` national calendar never includes early-close
(half-day) sessions. Euronext Paris's Christmas Eve/New Year's Eve early
closes are market-only and belong on the (not yet implemented) `XPAR`
calendar.

## Notes of Interest

**No weekend roll is an intentional deviation from Java, not a gap.**
Upstream `HolidayCalendarServiceFR` rolls weekend fixed holidays to the
previous Friday or following Monday. This codebase does not, because French
practice grants no substitute day when a public holiday falls on a weekly
rest day (absent a more favorable collective agreement). For example, in
2026 Assumption Day (Saturday August 15) and All Saints' Day (Sunday
November 1) stay on those dates. Do not "restore parity" by re-adding the
roll; the Java behavior should be reported upstream instead (see
`docs/BUILD_SPEC.md` §2.2).

**The 11 holidays are France's statutory "jours fériés" and need no
state-level caveat.** French public holidays are set uniformly at the
national level, unlike `AU` (state variance) or `CH` (cantonal variance).
The one regional exception is Alsace-Moselle, which per upstream Java's
docs additionally observes Good Friday and St. Stephen's Day (December 26)
because of a historical legal carve-out predating reunification with France.
This codebase does not model that regional exception.

**Easter-based dates use Western (Gregorian) Easter** via `westernEaster`.

## Sources

- The no-roll rationale cites Urssaf and the Cour de Cassation, as recorded
  in `docs/BUILD_SPEC.md` §2.2 (issue #57). Those citations were carried
  over from that spec and not independently re-verified when writing this
  page.
- The 11-holiday list matches the "jours fériés" enumerated in French labor
  law (Code du travail, Article L3133-1), per upstream
  `holiday-calendar-java`'s `docs/calendars/FR.md`; this was not
  independently re-verified against Légifrance here.
- The Alsace-Moselle exception is taken from upstream
  `holiday-calendar-java`'s `docs/calendars/FR.md` and was not independently
  verified against a primary source.
