# AUD — Australia (RBA) Holidays

- **Standard:** ISO 4217 `AUD`
- **Category:** Central Bank/Settlement
- **Sibling calendars:** [AU](./AU.md) (national), `XASX` (ASX, not yet implemented) — `AUD` omits Easter Saturday (which `AU` and `XASX` carry) and adds an NSW-specific "Bank Holiday" that neither sibling has.
- **Implementation:** `createAUDCalendar()` / `audProvider` (`packages/western/src/calendars/aud.ts`)

## Weekend & Date Roll

- **Weekend days:** Saturday + Sunday
- **Roll strategy:** `auFixedHolidayRoll` (shared with `AU`): Saturday -> +2, Sunday -> +1, except Christmas Day/Boxing Day on a Sunday which roll +2.
- **Rollability:** Good Friday, Easter Monday, King's Birthday and Bank Holiday are non-rollable (weekday-anchored). All fixed-date holidays are rollable.

### Deliberate deviation from Java v2.1.0

Java's `HolidayCalendarServiceAUD` uses `DateRolls.previousFridayOrFollowingMonday()`, and issue #9 asked for it. This port does **not**, because it disagrees with RBA practice:

- The RBA's own *Public & Bank Holidays* page for 2026 lists Boxing Day (Sat 26 Dec) as "Boxing Day Observed" on **Mon 28 Dec**. The Java roll would give Fri 25 Dec (colliding with Christmas) and leave Dec 28 open.
- ANZ's institutional 2026 holiday notice shows the same 25 / 26 / 28 December pattern.
- NSW's Banks and Bank Holidays Act 1912 substitutes Sunday holidays forward to Monday.
- No source located describes a backward-to-Friday substitution for any Australian holiday.

Dates therefore differ from Java for Saturday holidays (e.g. Christmas 2021: Java Fri Dec 24, here Mon Dec 27). A Java-side issue should be raised.

## Holidays

| Name | Type | Rollable | Notes |
|------|------|----------|-------|
| New Year's Day | FIXED | Yes | |
| Australia Day | FIXED | Yes | January 26 |
| Good Friday | FLOATING | No | |
| Easter Monday | FLOATING | No | |
| ANZAC Day | FIXED | Yes | April 25; coincides with Easter Monday in some years (2011, 2038) |
| King's Birthday | FLOATING | No | 2nd Monday in June (Queensland/WA variation not modeled, see AU.md) |
| Bank Holiday | FLOATING | No | NSW only; 1st Monday in August |
| Christmas Day | FIXED | Yes | |
| Boxing Day | FIXED | Yes | |

## Notes of Interest

- `AUD` is not a subset of `AU`: it adds the NSW Bank Holiday and drops Easter Saturday. The inclusion is defensible because RBA settlement is in Sydney, but Java documents no RBA primary source for it. The Bank Holiday does **not** belong on `AU`.
- RITS is closed on weekends and on listed holidays "where they are observed in NSW and Victoria"; the NSW-only Bank Holiday only drops the RITS evening session. This calendar does not model that distinction.
- ANZAC Day on a weekend has no national substitute; the forward roll matches NSW (RBA 2026: 27 Apr "Additional Day" for ACT/NSW/WA) but not Victoria — same caveat as `AU`.
- `calculate()` does not dedupe: ANZAC Day and Easter Monday both appear on one date in 2011 and 2038.
- Settlement calendars should not be merged with national ones (see `docs/BUILD_SPEC.md` §2).

## Sources

- [RBA Public & Bank Holidays](https://www.rba.gov.au/schedules-events/bank-holidays/) (2026 page)
- [RBA RITS Business Hours](https://www.rba.gov.au/payments-and-infrastructure/rits/business-hours.html)
- [ANZ Australian public holidays 2026](https://www.anz.com/content/dam/anzcom/pdf/institutional/australian-public-holidays-2026.pdf)
- Java `docs/calendars/AUD.md` and `HolidayCalendarServiceAUD` at `v2.1.0`
