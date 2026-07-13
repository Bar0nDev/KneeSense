export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatAngle(value: number | null | undefined): string {
  return value != null ? `${value.toFixed(1)}°` : "—";
}

export function formatPercent(value: number | null | undefined): string {
  return value != null ? `${value.toFixed(1)}%` : "—";
}
