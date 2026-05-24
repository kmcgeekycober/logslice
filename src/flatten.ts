import { LogEntry } from "./types";

/**
 * Flattens a nested object into a single-level object with dot-notation keys.
 */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = "",
  maxDepth = 5,
  depth = 0
): Record<string, unknown> {
  if (depth >= maxDepth) return { [prefix]: obj };

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const nested = flattenObject(
        value as Record<string, unknown>,
        fullKey,
        maxDepth,
        depth + 1
      );
      Object.assign(result, nested);
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

/**
 * Flattens a single LogEntry, preserving top-level timestamp/level/message
 * and flattening any nested fields.
 */
export function flattenEntry(
  entry: LogEntry,
  maxDepth = 5
): LogEntry {
  const { timestamp, level, message, ...rest } = entry;
  const flattened = flattenObject(rest as Record<string, unknown>, "", maxDepth);
  return { timestamp, level, message, ...flattened } as LogEntry;
}

/**
 * Flattens an array of LogEntry objects.
 */
export function flattenEntries(
  entries: LogEntry[],
  maxDepth = 5
): LogEntry[] {
  return entries.map((e) => flattenEntry(e, maxDepth));
}

/**
 * Parses a flatten option string like "depth:3" or "flat" (default depth 5).
 */
export function parseFlattenOption(option: string): number {
  const match = option.match(/^(?:depth:)?(\d+)$/);
  if (match) return parseInt(match[1], 10);
  if (option === "flat" || option === "true") return 5;
  throw new Error(`Invalid flatten option: "${option}". Use "flat" or "depth:<n>".`);
}
