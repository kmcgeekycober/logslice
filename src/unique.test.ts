import { describe, it, expect } from "vitest";
import {
  parseUniqueOption,
  uniqueLogs,
  getFieldString,
  formatUniqueSummary,
} from "./unique";
import { LogEntry } from "./types";

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    timestamp: "2024-01-01T00:00:00Z",
    level: "info",
    message: "test",
    ...overrides,
  } as LogEntry;
}

describe("parseUniqueOption", () => {
  it("parses field name only (keepFirst default)", () => {
    expect(parseUniqueOption("level")).toEqual({ field: "level", keepFirst: true });
  });

  it("parses field:first", () => {
    expect(parseUniqueOption("level:first")).toEqual({ field: "level", keepFirst: true });
  });

  it("parses field:last", () => {
    expect(parseUniqueOption("level:last")).toEqual({ field: "level", keepFirst: false });
  });

  it("throws if field is empty", () => {
    expect(() => parseUniqueOption("")).toThrow("unique: field name is required");
  });
});

describe("getFieldString", () => {
  it("returns string value", () => {
    const e = makeEntry({ level: "warn" });
    expect(getFieldString(e, "level")).toBe("warn");
  });

  it("returns empty string for missing field", () => {
    const e = makeEntry();
    expect(getFieldString(e, "nonexistent")).toBe("");
  });

  it("serializes objects", () => {
    const e = { ...makeEntry(), meta: { a: 1 } } as LogEntry;
    expect(getFieldString(e, "meta")).toBe('{"a":1}');
  });
});

describe("uniqueLogs", () => {
  it("removes duplicate entries keeping first", () => {
    const entries = [
      makeEntry({ level: "info" }),
      makeEntry({ level: "warn" }),
      makeEntry({ level: "info" }),
    ];
    const result = uniqueLogs(entries, { field: "level", keepFirst: true });
    expect(result).toHaveLength(2);
    expect(result[0].level).toBe("info");
    expect(result[1].level).toBe("warn");
  });

  it("removes duplicate entries keeping last", () => {
    const entries = [
      makeEntry({ level: "info", message: "first" }),
      makeEntry({ level: "warn" }),
      makeEntry({ level: "info", message: "last" }),
    ];
    const result = uniqueLogs(entries, { field: "level", keepFirst: false });
    expect(result).toHaveLength(2);
    const infoEntry = result.find((e) => e.level === "info");
    expect(infoEntry?.message).toBe("last");
  });

  it("returns all entries when all unique", () => {
    const entries = [
      makeEntry({ level: "info" }),
      makeEntry({ level: "warn" }),
      makeEntry({ level: "error" }),
    ];
    expect(uniqueLogs(entries, { field: "level", keepFirst: true })).toHaveLength(3);
  });

  it("handles empty input", () => {
    expect(uniqueLogs([], { field: "level", keepFirst: true })).toEqual([]);
  });
});

describe("formatUniqueSummary", () => {
  it("formats summary correctly", () => {
    const msg = formatUniqueSummary(10, 7, "level");
    expect(msg).toBe("unique[level]: 7 entries kept, 3 duplicate(s) removed (10 total)");
  });
});
