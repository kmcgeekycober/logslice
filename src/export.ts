import { LogEntry } from "./types";

export type ExportFormat = "json" | "csv" | "ndjson";

export function exportJson(entries: LogEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function exportNdjson(entries: LogEntry[]): string {
  return entries.map((e) => JSON.stringify(e)).join("\n");
}

export function exportCsv(entries: LogEntry[]): string {
  if (entries.length === 0) return "";

  const allKeys = Array.from(
    entries.reduce((keys, entry) => {
      Object.keys(entry).forEach((k) => keys.add(k));
      return keys;
    }, new Set<string>())
  );

  const escapeCsv = (value: unknown): string => {
    const str = value === null || value === undefined ? "" : String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = allKeys.join(",");
  const rows = entries.map((entry) =>
    allKeys.map((key) => escapeCsv((entry as Record<string, unknown>)[key])).join(",")
  );

  return [header, ...rows].join("\n");
}

export function exportEntries(entries: LogEntry[], format: ExportFormat): string {
  switch (format) {
    case "json":
      return exportJson(entries);
    case "ndjson":
      return exportNdjson(entries);
    case "csv":
      return exportCsv(entries);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function parseExportFormat(raw: string): ExportFormat {
  const lower = raw.toLowerCase();
  if (lower === "json" || lower === "csv" || lower === "ndjson") {
    return lower as ExportFormat;
  }
  throw new Error(`Unknown export format "${raw}". Supported: json, csv, ndjson`);
}
