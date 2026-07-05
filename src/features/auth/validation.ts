import type { ApiFieldErrors } from "@/api/types";

export function validateLogin(values: { email: string; password: string }) {
  const errors: Record<string, string> = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateRegister(values: { fullName: string; email: string; password: string }) {
  const errors = validateLogin(values);

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!errors.password && values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  return errors;
}

export function getFieldError(fieldErrors: ApiFieldErrors | undefined, field: string) {
  return fieldErrors?.[field]?.[0];
}
