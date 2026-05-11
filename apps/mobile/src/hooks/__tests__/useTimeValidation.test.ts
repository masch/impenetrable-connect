import { isTimeInRange } from "../useTimeValidation";

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
});
