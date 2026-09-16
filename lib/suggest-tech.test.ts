import { describe, expect, it } from "vitest";
import { suggestTech } from "./suggest-tech";

describe("suggestTech", () => {
  it("ranks a zone match above a non-match", () => {
    const results = suggestTech("12 Maple St, Springfield", null, [
      { id: "a", name: "Alex", serviceZone: "Chicago", scheduledDates: [] },
      { id: "b", name: "Bailey", serviceZone: "Springfield", scheduledDates: [] },
    ]);

    expect(results[0].techId).toBe("b");
    expect(results[0].zoneMatch).toBe(true);
    expect(results[1].zoneMatch).toBe(false);
  });

  it("matches case-insensitively", () => {
    const results = suggestTech("1 Main St, SPRINGFIELD", null, [
      { id: "a", name: "Alex", serviceZone: "springfield", scheduledDates: [] },
    ]);
    expect(results[0].zoneMatch).toBe(true);
  });

  it("within equal zone status, ranks fewer jobs that day higher", () => {
    const results = suggestTech("12 Maple St, Springfield", "2026-01-15", [
      {
        id: "busy",
        name: "Busy Tech",
        serviceZone: "Springfield",
        scheduledDates: ["2026-01-15", "2026-01-15"],
      },
      { id: "free", name: "Free Tech", serviceZone: "Springfield", scheduledDates: [] },
    ]);

    expect(results[0].techId).toBe("free");
    expect(results[0].jobsThatDay).toBe(0);
    expect(results[1].techId).toBe("busy");
    expect(results[1].jobsThatDay).toBe(2);
  });

  it("zone match still outranks a zoneless tech with zero jobs that day", () => {
    const results = suggestTech("12 Maple St, Springfield", "2026-01-15", [
      { id: "nozone", name: "No Zone", serviceZone: null, scheduledDates: [] },
      {
        id: "matched",
        name: "Matched",
        serviceZone: "Springfield",
        scheduledDates: ["2026-01-15"],
      },
    ]);

    expect(results[0].techId).toBe("matched");
  });

  it("does not fabricate a free time — reason names a job count, not a clock time", () => {
    const results = suggestTech("12 Maple St, Springfield", "2026-01-15", [
      { id: "a", name: "Alex", serviceZone: "Springfield", scheduledDates: ["2026-01-15"] },
    ]);
    expect(results[0].reason).toContain("1 job already scheduled that day");
    expect(results[0].reason).not.toMatch(/\d{1,2}(:\d{2})?\s*(am|pm)/i);
  });

  it("with no candidate date, says so rather than guessing availability", () => {
    const results = suggestTech("12 Maple St, Springfield", null, [
      { id: "a", name: "Alex", serviceZone: "Springfield", scheduledDates: ["2026-01-15"] },
    ]);
    expect(results[0].reason).toContain("no date selected yet");
  });
});
