/**
 * truncate.ts
 * Utilities for truncating long field values in log entries for display.
 */

import { LogEntry } from './types';

export const DEFAULT_MAX_LENGTH = 120;

/**
 * Truncates a string value to the given max length, appending an ellipsis if cut.
 */
export function truncateValue(value: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + '…';
}

/**
 * Truncates all string fields in a log entry that exceed maxLength.
 * Non-string fields are left untouched.
 */
export function truncateEntry(
  entry: LogEntry,
  maxLength: number = DEFAULT_MAX_LENGTH
): LogEntry {
  const result: LogEntry = {};
  for (const [key, val] of Object.entries(entry)) {
    if (typeof val === 'string') {
      result[key] = truncateValue(val, maxLength);
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Applies truncation to all entries in an array.
 */
export function truncateEntries(
  entries: LogEntry[],
  maxLength: number = DEFAULT_MAX_LENGTH
): LogEntry[] {
  return entries.map((entry) => truncateEntry(entry, maxLength));
}
