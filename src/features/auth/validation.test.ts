import { describe, expect, it } from "vitest";

import { getFieldError, validateLogin, validateRegister } from "./validation";

describe("validateLogin", () => {
  it("requires email and password", () => {
    expect(validateLogin({ email: "", password: "" })).toEqual({
      email: "Email is required.",
      password: "Password is required.",
    });
  });

  it("rejects invalid email", () => {
    expect(validateLogin({ email: "not-an-email", password: "secret" })).toEqual({
      email: "Enter a valid email.",
    });
  });

  it("accepts valid credentials", () => {
    expect(
      validateLogin({ email: "user@example.com", password: "secret" }),
    ).toEqual({});
  });
});

describe("validateRegister", () => {
  it("requires full name and enforces password length", () => {
    expect(
      validateRegister({
        fullName: "",
        email: "user@example.com",
        password: "short",
      }),
    ).toEqual({
      fullName: "Full name is required.",
      password: "Use at least 8 characters.",
    });
  });
});

describe("getFieldError", () => {
  it("returns the first API field error", () => {
    expect(getFieldError({ email: ["Already registered."] }, "email")).toBe(
      "Already registered.",
    );
  });

  it("returns undefined when field is missing", () => {
    expect(getFieldError({ email: ["Already registered."] }, "password")).toBeUndefined();
  });
});
