import { describe, expect, it } from "vitest";
import {
  daysUntilFestival,
  FESTIVAL_END,
  FESTIVAL_START,
  festivalStatus,
} from "@/lib/festival";

describe("festival date helpers", () => {
  const start = new Date(FESTIVAL_START).getTime();
  const end = new Date(FESTIVAL_END).getTime();

  it("buckets the festival boundaries correctly", () => {
    expect(festivalStatus(start - 1)).toBe("upcoming");
    expect(festivalStatus(start)).toBe("live");
    expect(festivalStatus(end - 1)).toBe("live");
    expect(festivalStatus(end)).toBe("past");
  });

  it("rounds partial days up while upcoming and never returns negative days", () => {
    expect(daysUntilFestival(start - 24 * 60 * 60 * 1000 - 1)).toBe(2);
    expect(daysUntilFestival(start - 1)).toBe(1);
    expect(daysUntilFestival(start)).toBe(0);
    expect(daysUntilFestival(end + 1)).toBe(0);
  });
});
