export function hasReviewCooldownElapsed(
  lastRequestedAt: number | null,
  now: number,
  minimumDaysBetweenRequests: number,
) {
  if (!lastRequestedAt) return true;
  return now - lastRequestedAt >= minimumDaysBetweenRequests * 86_400_000;
}
