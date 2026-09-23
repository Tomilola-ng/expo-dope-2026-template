export type ComparableUpdatePolicy = {
  minimumVersion?: string | null;
  minimumBuild?: number | null;
  required?: boolean;
};

export function compareVersions(left: string, right: string) {
  const parse = (value: string) => value.split(/[.-]/).map((part) => Number.parseInt(part, 10) || 0);
  const a = parse(left);
  const b = parse(right);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference > 0 ? 1 : -1;
  }
  return 0;
}

export function isUpdateRequired(
  current: { version: string; build: number },
  policy: ComparableUpdatePolicy,
) {
  if (policy.required === true) return true;
  if (policy.minimumBuild != null && current.build < policy.minimumBuild) return true;
  return Boolean(
    policy.minimumVersion && compareVersions(current.version, policy.minimumVersion) < 0,
  );
}
