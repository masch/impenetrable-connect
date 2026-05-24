import { isTimeInRange, isTimeInPast } from "../useTimeValidation";

describe("useTimeValidation", () => {
  describe("isTimeInRange", () => {
    it("should return valid for time within breakfast range (09:30)", () => {
      const result = isTimeInRange("09:30", "BREAKFAST");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return valid for time at start of breakfast range (08:00)", () => {
      const result = isTimeInRange("08:00", "BREAKFAST");
      expect(result.valid).toBe(true);
    });

    it("should return valid for time at end of breakfast range (11:00)", () => {
      const result = isTimeInRange("11:00", "BREAKFAST");
      expect(result.valid).toBe(true);
    });

    it("should return invalid for time after breakfast range (12:30)", () => {
      const result = isTimeInRange("12:30", "BREAKFAST");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Time outside allowed range for BREAKFAST");
    });

    it("should return invalid for time before breakfast range (07:00)", () => {
      const result = isTimeInRange("07:00", "BREAKFAST");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Time outside allowed range for BREAKFAST");
    });

    it("should return valid for time within lunch range (13:00)", () => {
      const result = isTimeInRange("13:00", "LUNCH");
      expect(result.valid).toBe(true);
    });

    it("should return invalid for time after lunch range (15:30)", () => {
      const result = isTimeInRange("15:30", "LUNCH");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Time outside allowed range for LUNCH");
    });

    it("should return valid for time within dinner range (20:00)", () => {
      const result = isTimeInRange("20:00", "DINNER");
      expect(result.valid).toBe(true);
    });

    it("should return invalid for time before dinner range (18:00)", () => {
      const result = isTimeInRange("18:00", "DINNER");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Time outside allowed range for DINNER");
    });

    it("should return valid for time within snack range (17:00)", () => {
      const result = isTimeInRange("17:00", "SNACK");
      expect(result.valid).toBe(true);
    });

    it("should return invalid for time after snack range (18:30)", () => {
      const result = isTimeInRange("18:30", "SNACK");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Time outside allowed range for SNACK");
    });
  });

  describe("isTimeInPast", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should return false when selectedDate is null", () => {
      jest.setSystemTime(new Date("2024-01-15T10:00:00-03:00"));
      expect(isTimeInPast(null, new Date("2024-01-15T09:00:00-03:00"))).toBe(false);
    });

    it("should return false when selectedTime is null", () => {
      jest.setSystemTime(new Date("2024-01-15T10:00:00-03:00"));
      expect(isTimeInPast(new Date("2024-01-15T00:00:00-03:00"), null)).toBe(false);
    });

    it("should return false when selectedDate is a future date", () => {
      jest.setSystemTime(new Date("2024-01-15T10:00:00-03:00"));
      const tomorrow = new Date("2024-01-16T00:00:00-03:00");
      // Even a "past" time like 08:00 on a future date is not expired
      expect(isTimeInPast(tomorrow, new Date("2024-01-16T08:00:00-03:00"))).toBe(false);
    });

    it("should return false when selected time is in the future", () => {
      jest.setSystemTime(new Date("2024-01-15T10:00:00-03:00"));
      const today = new Date("2024-01-15T00:00:00-03:00");
      // 11:00 is in the future when now is 10:00
      expect(isTimeInPast(today, new Date("2024-01-15T11:00:00-03:00"))).toBe(false);
    });

    it("should return true when selected time is in the past", () => {
      jest.setSystemTime(new Date("2024-01-15T10:00:00-03:00"));
      const today = new Date("2024-01-15T00:00:00-03:00");
      // 09:00 is in the past when now is 10:00
      expect(isTimeInPast(today, new Date("2024-01-15T09:00:00-03:00"))).toBe(true);
    });

    it("should return true when selected time equals now (boundary)", () => {
      jest.setSystemTime(new Date("2024-01-15T10:00:00-03:00"));
      const today = new Date("2024-01-15T00:00:00-03:00");
      // 10:00 is now — it's already passing
      expect(isTimeInPast(today, new Date("2024-01-15T10:00:00-03:00"))).toBe(true);
    });
  });
});
