# AU — Australia National Holidays

- **Standard:** ISO 3166-1 alpha-2 `AU`
- **Category:** National
- **Sibling calendars:** `XASX` (Australian Securities Exchange) and `AUD`
  (Reserve Bank of Australia) are planned but not yet implemented in this
  repo (see `docs/BUILD_SPEC.md` §2/§3). Upstream Java shares all 9 holidays
  below between `AU` and `XASX` via a common `AuHolidays` factory; `XASX`
  only adds Christmas Eve/New Year's Eve early closes on top. `AUD`
  independently duplicates most of the same holidays but omits Easter
  Saturday and adds an NSW-specific Bank Holiday that neither `AU` nor
  `XASX` carries.
- **Implementation:** `createAUCalendar()` / `auProvider`
  (`packages/western/src/calendars/au.ts`)

## Weekend & Date Roll

- **Weekend days:** Saturday + Sunday
- **Roll strategy:** `auFixedHolidayRoll` (forward-only: Saturday -> +2,
  Sunday -> +1, except Christmas Day/Boxing Day on a Sunday which roll +2 to
  avoid colliding with each other) — deliberately not
  `DateRolls.previousFridayOrFollowingMonday()`, whose backward Saturday roll
  doesn't match real Australian substitute-holiday practice.
- **Rollability exceptions:** Good Friday, Easter Saturday, Easter Monday,
  and King's Birthday are `rollable: false` (weekday-anchored). All fixed
  holidays (New Year's Day, Australia Day, ANZAC Day, Christmas Day, Boxing
  Day) are `rollable: true`.

## Holidays

| Name | Type | Rollable | Notes |
|------|------|----------|-------|
| New Year's Day | Fixed | Yes | |
| Australia Day | Fixed | Yes | January 26 |
| Good Friday | Floating | No | |
| Easter Saturday | Floating | No | Day after Good Friday; **not observed in Western Australia or Tasmania** — see Notes of Interest |
| Easter Monday | Floating | No | |
| ANZAC Day | Fixed | Yes | April 25; weekend-substitute observance varies by state/territory — see Notes of Interest |
| King's Birthday | Floating | No | Second Monday in June nationally; Queensland and Western Australia use different dates — see Notes of Interest |
| Christmas Day | Fixed | Yes | |
| Boxing Day | Fixed | Yes | |

## Early Closes

Not applicable — the `AU` national calendar never includes early-close
(half-day) sessions. ASX's Christmas Eve/New Year's Eve early closes are
market-only and belong on the (not yet implemented) `XASX` calendar.

## Notes of Interest

**Easter Saturday is a genuine state-level exception, not modeled per-state.**
It's included here as a single national entry, but is confirmed **not**
observed in Western Australia or Tasmania — a consumer needing a WA- or
Tasmania-specific calendar should be aware this codebase doesn't fork the
holiday list by state.

**ANZAC Day's weekend-substitute observance varies by state more than a
single national roll rule suggests.** Whether a missed public holiday is
granted when ANZAC Day falls on a weekend differs by state/territory — e.g.
in 2026, when ANZAC Day fell on Saturday April 25, NSW, WA, and the ACT
declared a Monday April 27 substitute holiday while VIC, QLD, SA, TAS, and
the NT did not (see Sources). This codebase applies one national
weekend-substitute convention (`auFixedHolidayRoll`) uniformly, the same
kind of majority-jurisdiction tradeoff made for Easter Saturday and King's
Birthday below — but note this specific variance is independently sourced,
**not** a policy call Java itself documents (unlike Easter Saturday and
King's Birthday below); see the closing paragraph.

**King's Birthday's date varies by state more than the single national entry
suggests.** Most Australian states observe it on the 2nd Monday in June
(aligned with the historical UK monarch's-birthday celebration), but
Queensland has observed it on the 1st Monday in October since 2016 (moved
specifically to spread public holidays more evenly through the year), and
Western Australia observes it on a locally-decided date in late September or
early October (typically the last Monday of September), set annually by the
state governor. This codebase models only the 2nd-Monday-in-June national
convention — the Queensland and Western Australia dates are not separately
represented.

Easter Saturday, ANZAC Day's roll behavior, and King's Birthday are all
retained in this single national list specifically because each reflects a
genuine, state-backed public holiday practice *somewhere* in the country —
the tradeoff is a national calendar that overstates observance for any
single state and understates the outlier dates/rules.

Easter Saturday and King's Birthday's inclusion mirrors upstream
`holiday-calendar-java`'s `AuHolidays.java` and its own
`docs/calendars/AU.md`, which document the identical policy call for those
two holidays specifically. ANZAC Day's weekend-substitute variance is
**not** part of that upstream policy call — Java's `AuHolidays.java` gives
ANZAC Day a plain, uncaveated entry and Java's own `docs/calendars/AU.md`
never discusses it. The variance is real and independently sourced (see
Sources below), but modeling it uniformly here is a gap specific to this
port, tracked in `docs/BUILD_SPEC.md` alongside the same
per-jurisdiction-modeling limitation for Easter Saturday and King's
Birthday.

## Sources

- Easter Saturday's exclusion in WA/Tasmania and King's Birthday's Queensland
  (1st Monday October, since 2016) and Western Australia (governor-set
  late-September/early-October date) variations are corroborated across
  [SBS News](https://www.sbs.com.au/news/article/kings-birthday-public-holiday-which-states-get-day-off/tz6nfmiar)
  and [Office Holidays — King's Birthday in Queensland](https://www.officeholidays.com/holidays/australia/queensland/australia-kings-birthday)
- No single official Australian federal government primary source
  enumerating all state-level public holiday variations was captured with a
  stable citation URL in this pass
- ANZAC Day's weekend-substitute variance (NSW/WA/ACT declaring a Monday
  substitute when ANZAC Day falls on a weekend, vs. VIC/QLD/SA/TAS/NT not
  doing so) is corroborated by
  [SmartCompany](https://www.smartcompany.com.au/retail/anzac-day-2026-public-holiday-monday-which-states-australia/),
  [ABC News](https://www.abc.net.au/news/2026-01-26/how-public-holidays-work-annual-leave/106207590),
  [The Conversation](https://theconversation.com/this-anzac-day-falls-on-a-saturday-and-these-states-will-be-getting-an-extra-public-holiday-279858),
  and [FairWork Mate](https://fairworkmate.com.au/blog/anzac-day-2026-saturday-public-holiday),
  using the 2026 occurrence (ANZAC Day on Saturday April 25) as the worked
  example. This is independent of, and not documented by, upstream
  `holiday-calendar-java`.
