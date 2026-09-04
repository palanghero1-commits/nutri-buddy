import { describe, expect, it } from "vitest";
import { isRequestSuccessful, normalizeGrowthDateInput } from "@/lib/featureGuard";

describe("feature guard helpers", () => {
  it("converts month-only growth dates to a usable full date", () => {
    expect(normalizeGrowthDateInput("2026-08")).toBe("2026-08-01");
  });

  it("treats unsuccessful API responses as failed requests", () => {
    expect(isRequestSuccessful({ success: false, message: "Invalid credentials" })).toBe(false);
    expect(isRequestSuccessful({ success: true, message: "Saved" })).toBe(true);
  });
});
