export function formatCompactCount(count: number): string {
  if (count < 10_000) return String(count);

  if (count < 100_000_000) {
    const man = count / 10_000;
    if (man >= 100) return `${Math.round(man)}万`;
    const rounded = Math.round(man * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}万` : `${rounded}万`;
  }

  const oku = count / 100_000_000;
  if (oku >= 100) return `${Math.round(oku)}億`;
  const rounded = Math.round(oku * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}億` : `${rounded}億`;
}
