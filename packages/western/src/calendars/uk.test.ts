import { describe, it, expect } from 'vitest';
import { Temporal } from '@holiday-calendar/core';
import type { HolidayDate } from '@holiday-calendar/core';
import { createUKCalendar, ukProvider } from './uk.js';

const d = (iso: string) => Temporal.PlainDate.from(iso);

const nameOn = (dates: HolidayDate[], iso: string): string | undefined =>
  dates.find((hd) => hd.date.equals(d(iso)))?.holiday.name;

describe('UK calendar — basic wiring', () => {
  const calendar = createUKCalendar();

  it('has exactly 12 configured holidays', () => {
    expect(calendar.holidays).toHaveLength(12);
  });

  it('code/name/provider are wired correctly', () => {
    expect(calendar.code).toBe('UK');
    expect(calendar.name).toBe('United Kingdom National Holidays');
    expect(ukProvider.code).toBe('UK');
    expect(ukProvider.getCalendar().code).toBe('UK');
  });
});

describe('UK calendar — exact holiday set, non-jubilee year (2024)', () => {
  const calendar = createUKCalendar();

  it('matches all 12 [name, date] pairs in chronological order', () => {
    const result = calendar.calculate(2024);
    const expected: Array<[string, string]> = [
      ["New Year's Day", '2024-01-01'],
      ['Good Friday', '2024-03-29'],
      ['Easter Monday', '2024-04-01'],
      ['Early May Bank Holiday', '2024-05-06'],
      ['Spring Bank Holiday', '2024-05-27'],
      ['Summer Bank Holiday', '2024-08-26'],
      ['Christmas Day', '2024-12-25'],
      ['Boxing Day', '2024-12-26'],
    ];
    expect(result).toHaveLength(8);
    expected.forEach(([name, iso], i) => {
      expect(result[i]?.holiday.name).toBe(name);
      expect(result[i]?.date.equals(d(iso))).toBe(true);
    });
  });
});

describe('UK calendar — exact holiday set, jubilee year (2022)', () => {
  const calendar = createUKCalendar();

  it('matches all 9 [name, date] pairs in chronological order, including both the moved Spring Bank Holiday and the Platinum Jubilee', () => {
    const result = calendar.calculate(2022);
    const expected: Array<[string, string]> = [
      ["New Year's Day", '2022-01-03'],
      ['Good Friday', '2022-04-15'],
      ['Easter Monday', '2022-04-18'],
      ['Early May Bank Holiday', '2022-05-02'],
      ['Spring Bank Holiday', '2022-06-02'],
      ['Platinum Jubilee Bank Holiday', '2022-06-03'],
      ['Summer Bank Holiday', '2022-08-29'],
      ['Boxing Day', '2022-12-26'], // rolled onto no day (Mon, no roll needed) — resolves before Christmas Day
      ['Christmas Day', '2022-12-27'], // Sunday -> rolls +2 to Dec 27, after Boxing Day's resolved date
    ];
    expect(result).toHaveLength(9);
    expected.forEach(([name, iso], i) => {
      expect(result[i]?.holiday.name).toBe(name);
      expect(result[i]?.date.equals(d(iso))).toBe(true);
    });
  });
});

describe("UK calendar — New Year's Day / Christmas / Boxing Day roll (regression for Java issues #96/#97)", () => {
  const calendar = createUKCalendar();

  it.each([
    // year, NYD, Christmas, Boxing Day
    [2021, '2021-01-01', '2021-12-27', '2021-12-28'], // Fri NYD no-roll; Sat Xmas +2; Sun Boxing +2
    [2022, '2022-01-03', '2022-12-27', '2022-12-26'], // Sat NYD +2; Sun Xmas +2; Mon Boxing no-roll
    [2023, '2023-01-02', '2023-12-25', '2023-12-26'], // Sun NYD +1 (not +2); Mon/Tue no-roll
    [2026, '2026-01-01', '2026-12-25', '2026-12-28'], // Thu/Fri no-roll; Sat Boxing +2
    [2027, '2027-01-01', '2027-12-27', '2027-12-28'], // Fri NYD no-roll; Sat Xmas +2; Sun Boxing +2
    [2028, '2028-01-03', '2028-12-25', '2028-12-26'], // Sat NYD +2; Mon/Tue no-roll
  ])('%i: NYD %s, Christmas %s, Boxing Day %s', (year, nyd, christmas, boxing) => {
    const dates = calendar.calculate(year);
    expect(nameOn(dates, nyd)).toBe("New Year's Day");
    expect(nameOn(dates, christmas)).toBe('Christmas Day');
    expect(nameOn(dates, boxing)).toBe('Boxing Day');
  });

  it("a Sunday collision resolves to +1 for NYD but +2 for Christmas/Boxing in the same year (2023 vs the Christmas/Boxing case above)", () => {
    const dates = calendar.calculate(2023);
    // 2023-01-01 is a Sunday
    expect(nameOn(dates, '2023-01-02')).toBe("New Year's Day"); // +1, not +2 (would be 01-03)
    expect(
      dates.some((hd) => hd.date.equals(d('2023-01-03')) && hd.holiday.name === "New Year's Day"),
    ).toBe(false);
  });

  // Ported from holiday-calendar-java v2.1.0's HolidayCalendarServiceUKTest
  it("testDateRoll_DefaultCase: 2020 New Year's Day, no roll (Wed 1 Jan)", () => {
    expect(nameOn(calendar.calculate(2020), '2020-01-01')).toBe("New Year's Day");
  });

  it("testDateRoll_NewYearsDaySaturday: 2022 New Year's Day rolls to Jan 3", () => {
    expect(nameOn(calendar.calculate(2022), '2022-01-03')).toBe("New Year's Day");
  });

  it("testDateRoll_NewYearsDaySunday: 2023 New Year's Day rolls to Jan 2", () => {
    expect(nameOn(calendar.calculate(2023), '2023-01-02')).toBe("New Year's Day");
  });

  it('testDateRoll_BoxingDayCase: 2021 Boxing Day rolls to Dec 28 (Sun +2)', () => {
    expect(nameOn(calendar.calculate(2021), '2021-12-28')).toBe('Boxing Day');
  });

  it.each([
    [2018, 'Christmas Day', '2018-12-25'],
    [2018, 'Boxing Day', '2018-12-26'],
    [2019, 'Christmas Day', '2019-12-25'],
    [2019, 'Boxing Day', '2019-12-26'],
    [2020, 'Christmas Day', '2020-12-25'],
    [2020, 'Boxing Day', '2020-12-28'],
    [2021, 'Christmas Day', '2021-12-27'],
    [2021, 'Boxing Day', '2021-12-28'],
    [2022, 'Christmas Day', '2022-12-27'],
    [2022, 'Boxing Day', '2022-12-26'],
    [2023, 'Christmas Day', '2023-12-25'],
    [2023, 'Boxing Day', '2023-12-26'],
  ])('%i %s -> %s (ported from Java expectedHolidayOccurrences)', (year, name, iso) => {
    expect(nameOn(calendar.calculate(year), iso)).toBe(name);
  });
});

describe('UK calendar — jubilee SpecialAnniversary only appears in its own year', () => {
  const calendar = createUKCalendar();

  it('Silver Jubilee Bank Holiday appears in 1977 but not 1976 or 1978', () => {
    expect(
      calendar.calculate(1977).some((hd) => hd.holiday.name === 'Silver Jubilee Bank Holiday'),
    ).toBe(true);
    expect(
      calendar.calculate(1976).some((hd) => hd.holiday.name === 'Silver Jubilee Bank Holiday'),
    ).toBe(false);
    expect(
      calendar.calculate(1978).some((hd) => hd.holiday.name === 'Silver Jubilee Bank Holiday'),
    ).toBe(false);
  });
});

describe('UK calendar — scope boundary (national vs. market)', () => {
  const calendar = createUKCalendar();

  it("never includes Christmas Eve or New Year's Eve (those are XLON market early closes, out of scope for UK)", () => {
    const names = calendar.calculate(2025).map((hd) => hd.holiday.name);
    expect(names).not.toContain('Christmas Eve');
    expect(names).not.toContain("New Year's Eve");
  });
});
