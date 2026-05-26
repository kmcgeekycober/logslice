import { LogEntry } from "./types";

export interface MergeOptions {
  sources: LogEntry[][];
  sortField?: string;
  deduplicate?: boolean;
}

export interface MergeResult {
  entries: LogEntry[];
  totalInput: number;
  duplicatesRemoved: number;
  sourceCount: number;
}

/**
 * Merges multiple sorted log entry arrays into a single sorted array.
 * Assumes each source array is already sorted by the given field.
 */
export function mergeSorted(
  sources: LogEntry[][],
  sortField: string = "timestamp"
): LogEntry[] {
  const indices = new Array(sources.length).fill(0);
  const result: LogEntry[] = [];

  while (true) {
    let minVal: string | undefined;
    let minSrc = -1;

    for (let i = 0; i < sources.length; i++) {
      if (indices[i] >= sources[i].length) continue;
      const entry = sources[i][indices[i]];
      const val = String(entry[sortField] ?? "");
      if (minSrc === -1 || val < minVal!) {
        minVal = val;
        minSrc = i;
      }
    }

    if (minSrc === -1) break;
    result.push(sources[minSrc][indices[minSrc]]);
    indices[minSrc]++;
  }

  return result;
}

export function mergeDedup(entries: LogEntry[], sortField: string): LogEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = JSON.stringify(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mergeLogs(options: MergeOptions): MergeResult {
  const { sources, sortField = "timestamp", deduplicate = false } = options;
  const totalInput = sources.reduce((sum, s) => sum + s.length, 0);

  let merged = mergeSorted(sources, sortField);
  let duplicatesRemoved = 0;

  if (deduplicate) {
    const before = merged.length;
    merged = mergeDedup(merged, sortField);
    duplicatesRemoved = before - merged.length;
  }

  return {
    entries: merged,
    totalInput,
    duplicatesRemoved,
    sourceCount: sources.length,
  };
}

export function parseMergeOptions(
  args: Record<string, unknown>
): Partial<MergeOptions> {
  return {
    sortField: typeof args["sort-field"] === "string" ? args["sort-field"] : "timestamp",
    deduplicate: args["dedup"] === true || args["dedup"] === "true",
  };
}
