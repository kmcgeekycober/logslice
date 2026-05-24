import { LogEntry } from './types';

export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

/**
 * Parses a sort expression like "timestamp:asc" or "level:desc".
 * Defaults to ascending if no direction is specified.
 */
export function parseSortOption(raw: string): SortOptions {
  const parts = raw.split(':');
  const field = parts[0].trim();
  const direction: SortDirection =
    parts[1]?.trim().toLowerCase() === 'desc' ? 'desc' : 'asc';
  if (!field) {
    throw new Error(`Invalid sort expression: "${raw}"`);
  }
  return { field, direction };
}

/**
 * Extracts a comparable value from a log entry by field name.
 * Returns undefined if the field is missing.
 */
function getFieldValue(entry: LogEntry, field: string): string | number | undefined {
  const val = (entry as Record<string, unknown>)[field];
  if (typeof val === 'string' || typeof val === 'number') {
    return val;
  }
  return undefined;
}

/**
 * Sorts an array of log entries by the given field and direction.
 * Entries missing the sort field are sorted to the end.
 */
export function sortLogs(entries: LogEntry[], options: SortOptions): LogEntry[] {
  const { field, direction } = options;
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...entries].sort((a, b) => {
    const aVal = getFieldValue(a, field);
    const bVal = getFieldValue(b, field);

    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    if (aVal < bVal) return -1 * multiplier;
    if (aVal > bVal) return 1 * multiplier;
    return 0;
  });
}
