import { describe, it, expect } from "vitest";
import {
  exportJson,
  exportNdjson,
  exportCsv,
  exportEntries,
  parseExportFormat,
} from "./export";
import { LogEntry } from "./types";

const entries: LogEntry[] = [
  { timestamp: "2024-01-01T00:00:00Z", level: "info", message: "started" },
  { timestamp: "2024-01-01T00:01:00Z", level: "error", message: "failed", code: 500 },
];

describe("exportJson", () => {
  it("produces valid JSON array", () => {
    const result = exportJson(entries);
    expect(JSON.parse(result)).toEqual(entries);
  });

  it("returns empty array for no entries", () => {
    expect(JSON.parse(exportJson([]))).toEqual([]);
  });
});

describe("exportNdjson", () => {
  it("produces one JSON object per line", () => {
    const lines = exportNdjson(entries).split("\n");
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0])).toEqual(entries[0]);
    expect(JSON.parse(lines[1])).toEqual(entries[1]);
  });

  it("returns empty string for no entries", () => {
    expect(exportNdjson([])).toBe("");
  });
});

describe("exportCsv", () => {
  it("returns empty string for no entries", () => {
    expect(exportCsv([])).toBe("");
  });

  it("includes header row", () => {
    const csv = exportCsv(entries);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("timestamp");
    expect(lines[0]).toContain("level");
    expect(lines[0]).toContain("message");
  });

  it("escapes commas in values", () => {
    const e: LogEntry[] = [{ timestamp: "t", level: "info", message: "a,b" }];
    const csv = exportCsv(e);
    expect(csv).toContain('"a,b"');
  });

  it("has correct number of data rows", () => {
    const lines = exportCsv(entries).split("\n");
    expect(lines).toHaveLength(3); // header + 2 rows
  });
});

describe("exportEntries", () => {
  it("delegates to correct format", () => {
    expect(exportEntries(entries, "ndjson")).toBe(exportNdjson(entries));
    expect(exportEntries(entries, "json")).toBe(exportJson(entries));
    expect(exportEntries(entries, "csv")).toBe(exportCsv(entries));
  });

  it("throws for unknown format", () => {
    expect(() => exportEntries(entries, "xml" as any)).toThrow();
  });
});

describe("parseExportFormat", () => {
  it("parses valid formats case-insensitively", () => {
    expect(parseExportFormat("JSON")).toBe("json");
    expect(parseExportFormat("CSV")).toBe("csv");
    expect(parseExportFormat("ndjson")).toBe("ndjson");
  });

  it("throws for unknown format", () => {
    expect(() => parseExportFormat("xml")).toThrow(/Unknown export format/);
  });
});
