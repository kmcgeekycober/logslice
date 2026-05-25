import { LogEntry } from "./types";

export interface CountOptions {
  groupBy?: string;
  field?: string;
}

export interface CountResult {
  key: string;
  count: number;
}

export function parseCountOption(raw: Record<string, string>): CountOptions {
  return {
    groupBy: raw["count-by"] ?? raw["groupBy"],
    field: raw["count-field"] ?? raw["field"],
  };
}

export function countLogs(
  entries: LogEntry[],
  options: CountOptions = {}
): CountResult[] {
  const { groupBy } = options;

  if (!groupBy) {
    return [{ key: "*", count: entries.length }];
  }

  const counts = new Map<string, number>();

  for (const entry of entries) {
    const raw = entry[groupBy];
    const key = raw !== undefined && raw !== null ? String(raw) : "(none)";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export function formatCountResults(
  results: CountResult[],
  groupBy?: string
): string {
  if (results.length === 0) {
    return "No entries to count.";
  }

  const label = groupBy ? `by "${groupBy}"` : "total";
  const header = `Count (${label}):`;

  const maxKeyLen = Math.max(...results.map((r) => r.key.length), 3);
  const maxCountLen = Math.max(...results.map((r) => String(r.count).length), 5);

  const divider = `+-${"-".repeat(maxKeyLen)}-+-${"-".repeat(maxCountLen)}-+`;
  const rows = results.map(
    (r) =>
      `| ${r.key.padEnd(maxKeyLen)} | ${String(r.count).padStart(maxCountLen)} |`
  );

  return [header, divider, ...rows, divider].join("\n");
}
