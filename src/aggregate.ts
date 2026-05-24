import { LogEntry } from './types';

export interface AggregateOptions {
  groupBy: string;
  countField?: string;
}

export interface AggregateResult {
  group: string;
  count: number;
  entries: LogEntry[];
}

/**
 * Groups log entries by a specified field value.
 */
export function groupLogs(
  entries: LogEntry[],
  field: string
): Map<string, LogEntry[]> {
  const groups = new Map<string, LogEntry[]>();

  for (const entry of entries) {
    const raw = entry[field];
    const key = raw !== undefined && raw !== null ? String(raw) : '(none)';
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(entry);
  }

  return groups;
}

/**
 * Aggregates log entries into counted groups sorted by count descending.
 */
export function aggregateLogs(
  entries: LogEntry[],
  options: AggregateOptions
): AggregateResult[] {
  const groups = groupLogs(entries, options.groupBy);
  const results: AggregateResult[] = [];

  for (const [group, groupEntries] of groups) {
    results.push({
      group,
      count: groupEntries.length,
      entries: groupEntries,
    });
  }

  results.sort((a, b) => b.count - a.count);
  return results;
}

/**
 * Formats aggregate results into human-readable lines.
 */
export function formatAggregateResults(
  results: AggregateResult[],
  groupBy: string
): string[] {
  return results.map(
    (r) => `${groupBy}=${r.group}  count=${r.count}`
  );
}
