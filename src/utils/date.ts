type RelativeTimeUnit = "year" | "month" | "week" | "day" | "hour" | "minute" | "second";

function formatRelativeTimeFallback(value: number, unit: RelativeTimeUnit) {
  const absoluteValue = Math.abs(value);
  const label = absoluteValue === 1 ? unit : `${unit}s`;

  if (value > 0) {
    return `in ${absoluteValue} ${label}`;
  }

  if (value < 0) {
    return `${absoluteValue} ${label} ago`;
  }

  return "just now";
}

export function formatRelativeTime(input?: string | null) {
  if (!input) {
    return "Just now";
  }

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const ranges = [
    { unit: "year", seconds: 60 * 60 * 24 * 365 },
    { unit: "month", seconds: 60 * 60 * 24 * 30 },
    { unit: "week", seconds: 60 * 60 * 24 * 7 },
    { unit: "day", seconds: 60 * 60 * 24 },
    { unit: "hour", seconds: 60 * 60 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ] as const;
  const canUseIntl =
    typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat === "function";
  const formatter = canUseIntl
    ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
    : null;

  for (const range of ranges) {
    if (Math.abs(seconds) >= range.seconds || range.unit === "second") {
      const value = Math.round(seconds / range.seconds);

      if (formatter) {
        return formatter.format(value, range.unit);
      }

      return formatRelativeTimeFallback(value, range.unit);
    }
  }

  return "Just now";
}

export function formatDateLabel(input?: string | null) {
  if (!input) {
    return "Not added yet";
  }

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
