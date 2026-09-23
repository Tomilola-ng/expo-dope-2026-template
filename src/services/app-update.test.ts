import { describe, expect, it } from "vitest";
import { compareVersions, isUpdateRequired } from "./app-update-policy";

describe("app update policy", () => {
  it("compares dotted versions", () => {
    expect(compareVersions("1.10.0", "1.9.9")).toBe(1);
    expect(compareVersions("2.0", "2.0.0")).toBe(0);
  });

  it("requires an update by build or version", () => {
    const current = { version: "1.2.0", build: 12 };
    expect(isUpdateRequired(current, { minimumBuild: 13 })).toBe(true);
    expect(isUpdateRequired(current, { minimumVersion: "1.3.0" })).toBe(true);
    expect(isUpdateRequired(current, { minimumVersion: "1.1.0", minimumBuild: 10 })).toBe(false);
  });
});
