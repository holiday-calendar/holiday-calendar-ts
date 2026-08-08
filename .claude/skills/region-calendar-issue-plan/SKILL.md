---
name: region-calendar-issue-plan
description: Turn a GitHub issue about a region/exchange-specific holiday-calendar change (new national/market calendar, new holiday, early-close/half-day modeling, roll-rule change) into a reviewed implementation plan for this repo, using a 4-agent workflow (research analyst, senior engineer, test engineer, devil's advocate). Use when planning work for a `HolidayCalendarProvider` for a given code, or any issue that names a specific market/region convention (close times, eligibility rules, observance dates) that must be verified before implementing.
---

# Region/exchange calendar issue → implementation plan

Produces a written plan (Plan Mode plan file) for a GitHub issue that adds or
changes holidays in a `packages/<region>/src/calendars/<code>.ts`
`HolidayCalendarProvider` in this repo. Do not write implementation code from
this skill — it only produces the plan. Requires: a GitHub issue number, and
the region/exchange code (e.g. `US`, `UK`, `CHF`) the issue targets. If the
user hasn't given both, ask first.

Run this inside Plan Mode. If not already in Plan Mode, invoke `EnterPlanMode`
before starting.

See `docs/BUILD_SPEC.md` for the target shape of core API surface (the four
`Holiday` kinds including `EarlyCloseHoliday`, the full `DateRolls` set, the
national-vs-market split) this repo is working towards — treat gaps between
that spec and the current code as expected, not as bugs to silently "fix" in
scope for an unrelated issue.

## Phase 1 — Read the issue, explore the codebase (parallel)

1. `gh issue view <number>` to get the exact requirements text. Do not
   paraphrase from memory — the issue text itself may contain an incorrect
   rule (this has happened before; catching it is the research analyst's job
   in Phase 2).
2. Launch up to 3 `Explore` agents in parallel:
   - **Core abstractions**: `packages/core/src/Holiday.ts` (the `Holiday`
     discriminated union and `fixedHoliday()`/`floatingHoliday()`/
     `specialAnniversary()` factories, plus `earlyCloseHoliday()` if it has
     landed per `docs/BUILD_SPEC.md`), `packages/core/src/function/Observance.ts`
     (`makeObservance`/`relativeObservance`), and
     `packages/core/src/HolidayCalendar.ts` (`calculate()`,
     `calculateEarlyCloses()`/`hasEarlyCloses()` if present, `merge()`). If
     the issue is about a half-day/early close, also check for the closest
     existing precedent calendar carrying one.
   - **Closest precedent for this specific issue**: find the calendar
     provider and `observances/<region>/` package for the target region, and
     the most recently-added holiday of the *same kind* elsewhere in the
     codebase (another early close, another new calendar, another roll-rule
     change — whichever matches this issue).
   - **Test infrastructure**: the closest existing `*.test.ts` precedent for
     an `Observance` and for a `HolidayCalendarProvider`, and any 30-year
     integration test file under `packages/<region>/src/__tests__/`.

## Phase 2 — Four specialist agents, run sequentially in the foreground

Run in the foreground (`run_in_background: false`) and in this order —
each later agent depends on the previous one's output, so do not parallelize:

1. **Research analyst** — verifies the issue's factual claims (dates, close
   times, eligibility rules, timezone) against primary sources (official
   exchange/market calendars, not secondary aggregators). Must explicitly
   flag any place the issue text is wrong or imprecise, and produce a
   multi-year fixture table an engineer/tester can build from.
2. **Senior engineer** — given the research findings and Phase 1 codebase
   context, proposes concrete files, factory-function usage, naming, and
   registration changes, and states plainly whether `@holiday-calendar/core`
   changes are needed (usually none are, if this fits an existing `Holiday`
   kind). Must not assume the closest precedent's *mechanism* transfers
   unchanged — state explicitly what's the same and what's different (e.g.
   "shift to nearest weekday" vs "suppress entirely in some years" are
   different semantics that look similar).
3. **Test engineer** — given the engineer's finalized design, proposes new
   test files/cases grounded in the research analyst's fixture table, reusing
   existing Vitest test patterns for observances and calendar providers, and
   proposing a 30-year integration test addition if the change is long-lived.
4. **Devil's advocate** — given the combined draft (research + engineering +
   test sections), actively looks for holes: mismatched precedent semantics,
   unverified assumptions, missing edge-year coverage, breaking-change
   handling, and repo-convention claims that aren't actually true (verify
   against real commit history, e.g. whether a CHANGELOG is actually updated
   per-PR or only at release — check, don't assume either way).

Prompt templates for all four agents: see [AGENT_PROMPTS.md](AGENT_PROMPTS.md).

## Phase 3 — Resolve findings, don't just collect them

Every devil's-advocate finding must be resolved before the plan is written,
not appended as a footnote:
- If it's a factual question only the user can answer (naming preference,
  version/release targeting, scope) → `AskUserQuestion`.
- If it's a verifiable claim (e.g. "does this repo actually update a
  CHANGELOG per PR?") → check it yourself (`git log`, `git show` on the
  closest precedent commits) and correct the plan.
- If it's a design concern → make the call and state the reasoning in the
  plan; don't leave it open.

## Phase 4 — Write the plan and exit

Write the plan file with these sections:
- **Context** — why this change, what precedent it follows, what is
  genuinely different from that precedent (don't overstate similarity).
- **Implementation** — concrete new/changed files, factory-function calls,
  registration changes, naming decisions, explicit "no
  `@holiday-calendar/core` changes needed" confirmation (or what's needed if
  not).
- **Tests** — concrete new/updated test files, fixture tables sourced from
  the research analyst's verified data, and any 30-year integration test
  addition.
- **Verification** — the `pnpm` commands to run before considering this done
  (`pnpm test --project <region>`, `pnpm typecheck`).

Call `ExitPlanMode` once the plan is written and any open questions are
resolved.
