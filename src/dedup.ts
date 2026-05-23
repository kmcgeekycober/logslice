import { LogEntry } from './types';

export interface DedupOptions {
  fields?: string[];
  countField?: string;
}

/**
 * Generates a deduplication key for a log entry based on specified fields.
 * If no fields are specified, uses message and level.
 */
export function dedupKey(entry: LogEntry, fields: string[]): string {
  return fields
    .map((f) => {
      const val = (entry as Record<string, unknown>)[f];
      return val !== undefined ? String(val) : '';
    })
    .join('\x00');
}

/**
 * Deduplicates log entries, collapsing consecutive duplicate entries.
 * Optionally annotates each collapsed group with a count field.
 */
export function deduplicateLogs(
  entries: LogEntry[],
  options: DedupOptions = {}
): LogEntry[] {
  const fields = options.fields ?? ['level', 'message'];
  const countField = options.countField ?? '_count';

  if (entries.length === 0) return [];

  const result: LogEntry[] = [];
  let current: LogEntry | null = null;
  let currentKey: string | null = null;
  let count = 1;

  for (const entry of entries) {
    const key = dedupKey(entry, fields);

    if (key === currentKey && current !== null) {
      count++;
    } else {
      if (current !== null) {
        result.push(count > 1 ? { ...current, [countField]: count } : current);
      }
      current = entry;
      currentKey = key;
      count = 1;
    }
  }

  if (current !== null) {
    result.push(count > 1 ? { ...current, [countField]: count } : current);
  }

  return result;
}
