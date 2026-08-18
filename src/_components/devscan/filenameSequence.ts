interface ParsedSequenceFilename {
  prefix: string;
  category: string;
  number: number;
  padLength: number;
}

const FILENAME_PATTERN = /^(.+)_([A-Za-z]+)_(\d+)$/;

export function parseSequenceFilename(rawName: string): ParsedSequenceFilename | null {
  const trimmed = rawName.trim().replace(/\.png$/i, '');
  const match = trimmed.match(FILENAME_PATTERN);
  if (!match) return null;

  const [, prefix, category, numberStr] = match;
  const number = parseInt(numberStr, 10);
  if (!prefix.trim() || Number.isNaN(number)) return null;

  return {
    prefix: prefix.trim(),
    category: category.toUpperCase(),
    number,
    padLength: numberStr.length,
  };
}

export function buildSequenceFilename(
  prefix: string,
  category: string,
  number: number,
  padLength = 2,
): string {
  const padded = String(Math.max(number, 0)).padStart(padLength, '0');
  return `${prefix}_${category.toUpperCase()}_${padded}.png`;
}

export function generateFilenameSequence(
  startingFilename: string,
  count: number,
  fallbackPrefix: string,
  fallbackCategory: string,
): string[] {
  const parsed = parseSequenceFilename(startingFilename);

  const prefix = parsed?.prefix || fallbackPrefix;
  const category = parsed?.category || fallbackCategory;
  const startNumber = parsed ? parsed.number : 1;
  const padLength = parsed?.padLength ?? 2;

  return Array.from({ length: count }, (_, index) =>
    buildSequenceFilename(prefix, category, startNumber + index, padLength),
  );
}