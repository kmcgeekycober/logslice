import { LogEntry } from "./types";

export interface UniqueOptions {
  field: string;
  keepFirst: boolean;
}

export function parseUniqueOption(raw: string): UniqueOptions {
  const parts = raw.split(":");
  const field = parts[0]?.trim();
  if (!field) throw new Error("unique: field name is required");
  const keepFirst = parts[1]?.trim() !== "last";
  return { field, keepFirst };
}

export function getFieldString(entry: LogEntry, field: string): string {
  const val = (entry as Record<string, unknown>)[field];
  if (val === undefined || val === null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

export function uniqueLogs(
  entries: LogEntry[],
  options: UniqueOptions
): LogEntry[] {
  const seen = new Map<string, number>();
  const result: (LogEntry | null)[] = new Array(entries.length).fill(null);

  entries.forEach((entry, idx) => {
    const key = getFieldString(entry, options.field);
    if (!seen.has(key)) {
      seen.set(key, idx);
      result[idx] = entry;
    } else if (!options.keepFirst) {
      const prevIdx = seen.get(key)!;
      result[prevIdx] = null;
      seen.set(key, idx);
      result[idx] = entry;
    }
  });

  return result.filter((e): e is LogEntry => e !== null);
}

export function formatUniqueSummary(
  original: number,
  filtered: number,
  field: string
): string {
  const removed = original - filtered;
  return `unique[${field}]: ${filtered} entries kept, ${removed} duplicate(s) removed (${original} total)`;
}
