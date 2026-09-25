export function parseTimeElapsedMs(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const match = trimmedValue.match(
    /^(?:(\d+)\.)?(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))?$/,
  );
  if (!match) return null;

  const days = Number(match[1] ?? 0);
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  const seconds = Number(match[4]);
  const fraction = match[5] ? Number(`0.${match[5]}`) : 0;

  return Math.max(
    0,
    (((days * 24 + hours) * 60 + minutes) * 60 + seconds + fraction) * 1000,
  );
}