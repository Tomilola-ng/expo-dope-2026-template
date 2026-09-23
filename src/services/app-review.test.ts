import { describe, expect, it } from "vitest";
import { hasReviewCooldownElapsed } from "./app-review-policy";

describe("hasReviewCooldownElapsed", () => {
  const day = 86_400_000;

  it("allows the first request", () => {
    expect(hasReviewCooldownElapsed(null, 10 * day, 90)).toBe(true);
  });

  it("blocks requests inside the cooldown", () => {
    expect(hasReviewCooldownElapsed(10 * day, 99 * day, 90)).toBe(false);
  });

  it("allows requests at the boundary", () => {
    expect(hasReviewCooldownElapsed(10 * day, 100 * day, 90)).toBe(true);
  });
});
