import { isMomentExpired } from "../moments";

describe("isMomentExpired", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return false when selectedDate is null", () => {
    expect(isMomentExpired("BREAKFAST", null)).toBe(false);
  });

  it("should return false when selectedDate is a future date", () => {
    // Set "now" to 2024-01-15 10:00 ART
    jest.setSystemTime(new Date("2024-01-15T10:00:00-03:00"));
    const tomorrow = new Date("2024-01-16T00:00:00-03:00");
    expect(isMomentExpired("BREAKFAST", tomorrow)).toBe(false);
  });

  it("should return false when selectedDate is yesterday (past but not today)", () => {
    jest.setSystemTime(new Date("2024-01-15T10:00:00-03:00"));
    const yesterday = new Date("2024-01-14T00:00:00-03:00");
    expect(isMomentExpired("BREAKFAST", yesterday)).toBe(false);
  });

  it("should return false when moment end time has not passed yet", () => {
    // Breakfast ends at 11:00, it's 10:00
    jest.setSystemTime(new Date("2024-01-15T10:00:00-03:00"));
    const today = new Date("2024-01-15T00:00:00-03:00");
    expect(isMomentExpired("BREAKFAST", today)).toBe(false);
  });

  it("should return true when moment end time has passed", () => {
    // Breakfast ends at 11:00, it's 12:00
    jest.setSystemTime(new Date("2024-01-15T12:00:00-03:00"));
    const today = new Date("2024-01-15T00:00:00-03:00");
    expect(isMomentExpired("BREAKFAST", today)).toBe(true);
  });

  it("should return true when current time equals end time (boundary)", () => {
    // Breakfast ends at 11:00, it's exactly 11:00
    jest.setSystemTime(new Date("2024-01-15T11:00:00-03:00"));
    const today = new Date("2024-01-15T00:00:00-03:00");
    expect(isMomentExpired("BREAKFAST", today)).toBe(true);
  });

  it("should handle DINNER (late moment) correctly when expired", () => {
    // Dinner ends at 22:00, it's 23:00
    jest.setSystemTime(new Date("2024-01-15T23:00:00-03:00"));
    const today = new Date("2024-01-15T00:00:00-03:00");
    expect(isMomentExpired("DINNER", today)).toBe(true);
  });

  it("should handle DINNER correctly when still active", () => {
    // Dinner is 19:00-22:00, it's 20:00
    jest.setSystemTime(new Date("2024-01-15T20:00:00-03:00"));
    const today = new Date("2024-01-15T00:00:00-03:00");
    expect(isMomentExpired("DINNER", today)).toBe(false);
  });
});
