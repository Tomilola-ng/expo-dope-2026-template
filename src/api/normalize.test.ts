import { describe, expect, it } from "vitest";

import {
  getFileUrl,
  getPreferredFileUrl,
  sanitizeRemoteUrl,
} from "./normalize";

describe("sanitizeRemoteUrl", () => {
  it("trims and strips wrapping backticks", () => {
    expect(sanitizeRemoteUrl(" `https://cdn.example.com/a.png` ")).toBe(
      "https://cdn.example.com/a.png",
    );
  });

  it("returns null for empty values", () => {
    expect(sanitizeRemoteUrl("   ")).toBeNull();
    expect(sanitizeRemoteUrl(null)).toBeNull();
  });
});

describe("getFileUrl", () => {
  it("reads string and object file shapes", () => {
    expect(getFileUrl("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png",
    );
    expect(getFileUrl({ id: 1, url: "https://cdn.example.com/b.png" })).toBe(
      "https://cdn.example.com/b.png",
    );
  });
});

describe("getPreferredFileUrl", () => {
  it("falls back when primary is missing", () => {
    expect(
      getPreferredFileUrl(null, { id: 2, url: "https://cdn.example.com/fallback.png" }),
    ).toBe("https://cdn.example.com/fallback.png");
  });
});
