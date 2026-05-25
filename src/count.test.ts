import { countLogs, formatCountResults, parseCountOption } from "./count";
import { LogEntry } from "./types";

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    timestamp: "2024-01-01T00:00:00Z",
    level: "info",
    message: "test",
    ...overrides,
  } as LogEntry;
}

describe("parseCountOption", () => {
  it("parses count-by from raw args", () => {
    expect(parseCountOption({ "count-by": "level" })).toEqual({ groupBy: "level", field: undefined });
  });

  it("returns empty options when no keys present", () => {
    expect(parseCountOption({})).toEqual({ groupBy: undefined, field: undefined });
  });
});

describe("countLogs", () => {
  const entries = [
    makeEntry({ level: "info" }),
    makeEntry({ level: "info" }),
    makeEntry({ level: "error" }),
    makeEntry({ level: "warn" }),
  ];

  it("returns total count when no groupBy", () => {
    const results = countLogs(entries);
    expect(results).toEqual([{ key: "*", count: 4 }]);
  });

  it("groups by a given field", () => {
    const results = countLogs(entries, { groupBy: "level" });
    expect(results).toContainEqual({ key: "info", count: 2 });
    expect(results).toContainEqual({ key: "error", count: 1 });
    expect(results).toContainEqual({ key: "warn", count: 1 });
  });

  it("sorts results by count descending", () => {
    const results = countLogs(entries, { groupBy: "level" });
    expect(results[0].key).toBe("info");
  });

  it("handles missing field values as (none)", () => {
    const mixed = [makeEntry({ level: "info" }), makeEntry({} as Partial<LogEntry>)];
    const results = countLogs(mixed, { groupBy: "service" });
    expect(results).toContainEqual({ key: "(none)", count: 2 });
  });

  it("returns empty array for empty input", () => {
    expect(countLogs([], { groupBy: "level" })).toEqual([]);
  });
});

describe("formatCountResults", () => {
  it("shows a table for grouped results", () => {
    const results = [{ key: "info", count: 3 }, { key: "error", count: 1 }];
    const output = formatCountResults(results, "level");
    expect(output).toContain("level");
    expect(output).toContain("info");
    expect(output).toContain("3");
  });

  it("shows total label when no groupBy", () => {
    const output = formatCountResults([{ key: "*", count: 10 }]);
    expect(output).toContain("total");
    expect(output).toContain("10");
  });

  it("returns a message for empty results", () => {
    expect(formatCountResults([])).toBe("No entries to count.");
  });
});
