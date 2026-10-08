# CH — Switzerland National Holidays

- **Standard:** ISO 3166-1 alpha-2 `CH`
- **Category:** National
- **Sibling calendars:** `XSWX` (SIX Swiss Exchange) and `CHF` (SIC/SNB
  settlement) are planned but not yet implemented in this repo (see
  `docs/BUILD_SPEC.md` §2/§3). Per upstream Java, SIX is closed on every
  holiday observed by `CH`, plus two additional market-only holidays.
- **Implementation:** `createCHCalendar()` / `chProvider`
  (`packages/western/src/calendars/ch.ts`)

## Weekend & Date Roll

- **Weekend days:** Saturday + Sunday
- **Roll strategy:** `DateRolls.noRoll()` — **deliberately differs from
  upstream Java**, which uses `previousFridayOrFollowingMonday()` with the 5
  fixed holidays `rollable(true)`. Switzerland provides no federal substitute
  weekday when a public holiday falls on a weekend, so every fixed holiday
  stays on its calendar date, Saturday or Sunday included. See Notes of
  Interest and `docs/BUILD_SPEC.md` §2.3 (issue #56).
- **Rollability exceptions:** None — all 9 holidays are `rollable: false`.
  The four floating holidays (Good Friday, Easter Monday, Ascension Day,
  Whit Monday) are weekday-anchored; the 5 fixed holidays are non-rollable by
  design (see above).

## Holidays

| Name | Type | Rollable | Notes |
|------|------|----------|-------|
| New Year's Day | Fixed | No | January 1 |
| Good Friday | Floating | No | Friday before Western Easter Sunday; not observed in the cantons of Ticino or Valais — see Notes of Interest |
| Easter Monday | Floating | No | Day after Western Easter Sunday |
| Labour Day | Fixed | No | May 1; International Workers' Day |
| Ascension Day | Floating | No | 39 days after Easter Sunday (the "40th day," counting Easter Sunday as day 1) |
| Whit Monday | Floating | No | Monday after Whit Sunday (Pentecost) |
| Swiss National Day | Fixed | No | August 1; commemorates the Federal Charter of 1291. The only holiday here mandated by federal law — see Notes of Interest |
| Christmas Day | Fixed | No | December 25 |
| Boxing Day | Fixed | No | December 26; cantonal, not federal |

## Early Closes

Not applicable — the `CH` national calendar never includes early-close
(half-day) sessions. SIX Swiss Exchange's Christmas Eve/New Year's Eve
closures are market-only and belong on the (not yet implemented) `XSWX`
calendar.

## Notes of Interest

**No weekend roll is an intentional deviation from Java, not a gap.**
Upstream `HolidayCalendarServiceCH` rolls weekend fixed holidays to the
previous Friday or following Monday. This codebase does not, because Swiss
federal law gives no automatic right to a substitute weekday when a public
holiday lands on a weekend; individual cantons or employers may grant one by
agreement, but that is not a national-calendar rule. For example, Swiss
National Day on Sunday 2021-08-01 and Christmas Day on Saturday 2021-12-25
stay on those dates. Do not "restore parity" by re-adding the roll; the Java
behavior should be reported upstream instead (see `docs/BUILD_SPEC.md` §2.3).

**Only one holiday is federally mandated.** Switzerland has a single
federally-mandated nationwide public holiday: Swiss National Day (August 1),
made a mandatory paid holiday by the 1993 federal popular initiative, in
effect since 1994. Every other holiday in this list — including New Year's
Day and Christmas — is decided at the cantonal level; the 8 non-federal
holidays represent the **majority-cantonal convention**, not uniform federal
law.

**Good Friday varies by canton.** It is a public holiday in 24 of the 26
cantons, but **not** in Ticino or Valais, despite both being
majority-Catholic. Most banks and some businesses there still close or
reduce hours regardless.

This codebase models `CH` as a single canonical list (the majority-cantonal
convention) rather than per-canton variants — a simplification worth knowing
if a consumer needs holidays for a specific canton.

**Easter-based dates use Western (Gregorian) Easter** via `westernEaster`.

## Sources

- The no-roll rationale (ch.ch official government portal; Swiss
  labor-law/HR compliance summaries) is carried over from issue #56 and was
  not independently re-verified when writing this page.
- [Federal Department of Foreign Affairs (EDA) — National holiday and national anthem](https://www.eda.admin.ch/aboutswitzerland/en/home/gesellschaft/traditionen/nationalfeiertag.html)
  — Swiss National Day as the sole federally-mandated public holiday, and
  its basis in the 1993 popular initiative (via upstream
  `holiday-calendar-java`'s `docs/calendars/CH.md`; not re-verified here)
- [Swiss Federalism — Public holidays in the Swiss Confederation](https://swissfederalism.ch/en/public-holidays-swiss-confederation/)
  — cantonal-variation overview; not a primary government source (retrieved
  2026-08-04 upstream)
- Good Friday's Ticino/Valais exception is corroborated across third-party
  Swiss holiday aggregators per upstream; no single official cantons
  comparison page was located
