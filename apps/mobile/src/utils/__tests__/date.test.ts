import { getDatePartsInTimezone, HOURS_PER_DAY } from "../date";

// Helper to create ISODate in UTC that represents a specific local time in Argentina (-03:00)
// e.g., 10:00 ART = 13:00 UTC
function artDate(isoParts: string): Date {
  return new Date(`${isoParts}-03:00`);
}

describe("getDatePartsInTimezone", () => {
  describe("Argentina timezone (America/Argentina/Buenos_Aires, UTC-03:00)", () => {
    it("should return correct local parts for a morning time", () => {
      // 2024-01-15 10:30 ART = 2024-01-15 13:30 UTC
      const result = getDatePartsInTimezone(
        artDate("2024-01-15T10:30"),
        "America/Argentina/Buenos_Aires",
      );
      expect(result).toEqual({ year: 2024, month: 0, day: 15, hours: 10, minutes: 30 });
    });

    it("should return correct local parts for an afternoon time", () => {
      // 2024-01-15 16:45 ART = 2024-01-15 19:45 UTC
      const result = getDatePartsInTimezone(
        artDate("2024-01-15T16:45"),
        "America/Argentina/Buenos_Aires",
      );
      expect(result).toEqual({ year: 2024, month: 0, day: 15, hours: 16, minutes: 45 });
    });

    it("should return correct local parts at midnight", () => {
      // 2024-01-15 00:00 ART = 2024-01-15 03:00 UTC
      const result = getDatePartsInTimezone(
        artDate("2024-01-15T00:00"),
        "America/Argentina/Buenos_Aires",
      );
      expect(result).toEqual({ year: 2024, month: 0, day: 15, hours: 0, minutes: 0 });
    });

    it("should return hours strictly less than 24 at midnight", () => {
      // Ensure % 24 doesn't produce 24
      const result = getDatePartsInTimezone(
        artDate("2024-01-15T00:00"),
        "America/Argentina/Buenos_Aires",
      );
      expect(result.hours).toBeGreaterThanOrEqual(0);
      expect(result.hours).toBeLessThan(HOURS_PER_DAY);
    });
  });

  describe("Date boundary crossing", () => {
    it("should return the local date when UTC day is different (late ART)", () => {
      // 2024-01-15 22:00 ART = 2024-01-16 01:00 UTC
      // Local date should be Jan 15, not Jan 16
      const result = getDatePartsInTimezone(
        artDate("2024-01-15T22:00"),
        "America/Argentina/Buenos_Aires",
      );
      expect(result).toEqual({ year: 2024, month: 0, day: 15, hours: 22, minutes: 0 });
    });

    it("should return the local date when UTC day is different (early ART)", () => {
      // 2024-01-16 01:00 ART = 2024-01-16 04:00 UTC
      // Should still be Jan 16
      const result = getDatePartsInTimezone(
        artDate("2024-01-16T01:00"),
        "America/Argentina/Buenos_Aires",
      );
      expect(result).toEqual({ year: 2024, month: 0, day: 16, hours: 1, minutes: 0 });
    });

    it("should handle UTC+14 where local date is AHEAD of UTC", () => {
      // 2024-01-15 22:00 UTC = 2024-01-16 12:00 in Kiritimati (+14)
      const utcDate = new Date("2024-01-15T22:00:00Z");
      const result = getDatePartsInTimezone(utcDate, "Pacific/Kiritimati");
      expect(result).toEqual({ year: 2024, month: 0, day: 16, hours: 12, minutes: 0 });
    });

    it("should handle UTC-12 where local date is BEHIND UTC", () => {
      // 2024-01-16 01:00 UTC = 2024-01-15 13:00 in Baker Island (UTC-12, Etc/GMT+12)
      const utcDate = new Date("2024-01-16T01:00:00Z");
      const result = getDatePartsInTimezone(utcDate, "Etc/GMT+12");
      expect(result).toEqual({ year: 2024, month: 0, day: 15, hours: 13, minutes: 0 });
    });
  });

  describe("UTC+0 timezone", () => {
    it("should return the same date and time as UTC", () => {
      const utcDate = new Date("2024-06-15T14:30:00Z");
      const result = getDatePartsInTimezone(utcDate, "Etc/GMT");
      expect(result).toEqual({ year: 2024, month: 5, day: 15, hours: 14, minutes: 30 });
    });

    it("should handle UTC midnight correctly", () => {
      const utcDate = new Date("2024-06-15T00:00:00Z");
      const result = getDatePartsInTimezone(utcDate, "Etc/GMT");
      expect(result).toEqual({ year: 2024, month: 5, day: 15, hours: 0, minutes: 0 });
      expect(result.hours).toBeLessThan(HOURS_PER_DAY);
    });
  });

  describe("Half-hour offset timezone (Asia/Kolkata, UTC+05:30)", () => {
    it("should handle half-hour offset correctly", () => {
      // 2024-06-15 14:30 UTC = 2024-06-15 20:00 IST (UTC+05:30)
      const utcDate = new Date("2024-06-15T14:30:00Z");
      const result = getDatePartsInTimezone(utcDate, "Asia/Kolkata");
      expect(result).toEqual({ year: 2024, month: 5, day: 15, hours: 20, minutes: 0 });
    });

    it("should handle half-hour offset with minutes", () => {
      // 2024-06-15 14:15 UTC = 2024-06-15 19:45 IST
      const utcDate = new Date("2024-06-15T14:15:00Z");
      const result = getDatePartsInTimezone(utcDate, "Asia/Kolkata");
      expect(result).toEqual({ year: 2024, month: 5, day: 15, hours: 19, minutes: 45 });
    });
  });

  describe("Quarter-hour offset timezone (Asia/Kathmandu, UTC+05:45)", () => {
    it("should handle quarter-hour offset correctly", () => {
      // 2024-06-15 14:15 UTC = 2024-06-15 20:00 NPT (UTC+05:45)
      const utcDate = new Date("2024-06-15T14:15:00Z");
      const result = getDatePartsInTimezone(utcDate, "Asia/Kathmandu");
      expect(result).toEqual({ year: 2024, month: 5, day: 15, hours: 20, minutes: 0 });
    });

    it("should handle quarter-hour offset with non-trivial minutes", () => {
      // 2024-06-15 14:00 UTC = 2024-06-15 19:45 NPT
      const utcDate = new Date("2024-06-15T14:00:00Z");
      const result = getDatePartsInTimezone(utcDate, "Asia/Kathmandu");
      expect(result).toEqual({ year: 2024, month: 5, day: 15, hours: 19, minutes: 45 });
    });
  });

  describe("Month boundaries", () => {
    it("should handle last day of January → February (month 0 → 1)", () => {
      // 2024-01-31 23:00 ART = 2024-02-01 02:00 UTC
      const result = getDatePartsInTimezone(
        artDate("2024-01-31T23:00"),
        "America/Argentina/Buenos_Aires",
      );
      expect(result).toEqual({ year: 2024, month: 0, day: 31, hours: 23, minutes: 0 });
    });

    it("should handle last day of December → January (year boundary)", () => {
      // 2024-12-31 23:00 ART = 2025-01-01 02:00 UTC
      const result = getDatePartsInTimezone(
        artDate("2024-12-31T23:00"),
        "America/Argentina/Buenos_Aires",
      );
      expect(result).toEqual({ year: 2024, month: 11, day: 31, hours: 23, minutes: 0 });
    });

    it("should handle year boundary with UTC+14 (already next year)", () => {
      // 2024-12-31 10:00 UTC = 2025-01-01 00:00 Kiritimati (+14)
      const utcDate = new Date("2024-12-31T10:00:00Z");
      const result = getDatePartsInTimezone(utcDate, "Pacific/Kiritimati");
      expect(result).toEqual({ year: 2025, month: 0, day: 1, hours: 0, minutes: 0 });
    });
  });

  describe("Leap year", () => {
    it("should handle Feb 29 in a leap year", () => {
      // 2024-02-29 10:00 ART (leap year)
      const result = getDatePartsInTimezone(
        artDate("2024-02-29T10:00"),
        "America/Argentina/Buenos_Aires",
      );
      expect(result).toEqual({ year: 2024, month: 1, day: 29, hours: 10, minutes: 0 });
    });

    it("should handle Feb 28 in a non-leap year (2023)", () => {
      // 2023-02-28 10:00 ART
      const utcDate = new Date("2023-02-28T13:00:00Z"); // 10:00 ART
      const result = getDatePartsInTimezone(utcDate, "America/Argentina/Buenos_Aires");
      expect(result).toEqual({ year: 2023, month: 1, day: 28, hours: 10, minutes: 0 });
    });
  });

  describe("DST transition — Northern Hemisphere", () => {
    describe("Spring forward (America/New_York, UTC-05:00 → UTC-04:00)", () => {
      it("should handle the missing hour (2 AM → 3 AM) correctly", () => {
        // 2024-03-10 07:00 UTC = 2024-03-10 03:00 EDT (already sprung forward)
        // The 2 AM hour doesn't exist locally
        const utcDate = new Date("2024-03-10T07:00:00Z");
        const result = getDatePartsInTimezone(utcDate, "America/New_York");
        expect(result).toEqual({ year: 2024, month: 2, day: 10, hours: 3, minutes: 0 });
      });

      it("should handle the last moment before spring forward", () => {
        // 2024-03-10 06:59 UTC = 2024-03-10 01:59 EST (just before DST)
        const utcDate = new Date("2024-03-10T06:59:59Z");
        const result = getDatePartsInTimezone(utcDate, "America/New_York");
        expect(result).toEqual({ year: 2024, month: 2, day: 10, hours: 1, minutes: 59 });
      });
    });

    describe("Fall back (America/New_York, UTC-04:00 → UTC-05:00)", () => {
      it("should handle 1 AM EDT (before fall back)", () => {
        // 2024-11-03 05:00 UTC = 2024-11-03 01:00 EDT (first occurrence, UTC-04:00)
        const utcDate = new Date("2024-11-03T05:00:00Z");
        const result = getDatePartsInTimezone(utcDate, "America/New_York");
        expect(result).toEqual({ year: 2024, month: 10, day: 3, hours: 1, minutes: 0 });
      });

      it("should handle 1 AM EST (after fall back, same local time, different UTC)", () => {
        // 2024-11-03 06:00 UTC = 2024-11-03 01:00 EST (second occurrence, UTC-05:00)
        const utcDate = new Date("2024-11-03T06:00:00Z");
        const result = getDatePartsInTimezone(utcDate, "America/New_York");
        // Both should resolve to 01:00 local — Intl.DateTimeFormat handles the fold
        expect(result).toEqual({ year: 2024, month: 10, day: 3, hours: 1, minutes: 0 });
      });
    });
  });

  describe("DST transition — Southern Hemisphere", () => {
    // Australia/Sydney: DST Oct→Mar (UTC+11:00 summer, UTC+10:00 winter)
    describe("Spring forward (Sydney)", () => {
      it("should handle DST start correctly", () => {
        // 2024-10-06 01:00 UTC = 2024-10-06 12:00 AEDT (UTC+11:00, already forward)
        // 2 AM AEDT happens at 2024-10-05 15:00 UTC, so 01:00 UTC is fine
        const utcDate = new Date("2024-10-06T01:00:00Z");
        const result = getDatePartsInTimezone(utcDate, "Australia/Sydney");
        // AEDT (UTC+11): 01:00 UTC = 12:00 PM
        expect(result).toEqual({ year: 2024, month: 9, day: 6, hours: 12, minutes: 0 });
      });
    });

    describe("Fall back (Sydney)", () => {
      it("should handle DST end correctly", () => {
        // 2024-04-07 01:00 UTC — ambiguous in Sydney
        // Before fall back (AEDT UTC+11): 01:00 UTC = 12:00 PM
        const utcDate = new Date("2024-04-07T01:00:00Z");
        const result = getDatePartsInTimezone(utcDate, "Australia/Sydney");
        expect(result).toEqual({ year: 2024, month: 3, day: 7, hours: 11, minutes: 0 });
      });
    });
  });

  describe("Edge cases: hours always within [0, 24)", () => {
    it("should never return hours=24", () => {
      const testCases = [
        artDate("2024-01-15T00:00"),
        artDate("2024-06-15T12:00"),
        artDate("2024-12-31T23:59"),
      ];

      for (const date of testCases) {
        const result = getDatePartsInTimezone(date, "America/Argentina/Buenos_Aires");
        expect(result.hours).toBeGreaterThanOrEqual(0);
        expect(result.hours).toBeLessThan(HOURS_PER_DAY);
      }
    });

    it("should return 0 for hours at midnight across timezones", () => {
      // Midnight in different timezones
      const cases: [string, string][] = [
        ["2024-06-15T23:00:00Z", "Europe/London"], // 00:00 BST (UTC+01:00, summer)
        ["2024-06-15T00:00:00Z", "Etc/GMT"], // 00:00 UTC / GMT
        ["2024-01-15T03:00:00Z", "America/Argentina/Buenos_Aires"], // 00:00 ART (-03:00)
      ];

      for (const [utcStr, tz] of cases) {
        const result = getDatePartsInTimezone(new Date(utcStr), tz);
        expect(result.hours).toBe(0);
      }
    });
  });
});
