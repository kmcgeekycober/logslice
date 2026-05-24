import { diffEntries, diffLog, formatDiff, formatDiffs } from "./diff";
import { LogEntry } from "./types";

const entryA: LogEntry = {
  timestamp: "2024-01-01T00:00:00Z",
  level: "info",
  message: "start",
  service: "api",
};

const entryB: LogEntry = {
  timestamp: "2024-01-01T00:00:01Z",
  level: "warn",
  message: "start",
  requestId: "abc123",
};

describe("diffEntries", () => {
  it("detects added fields", () => {
    const diff = diffEntries(entryA, entryB);
    expect(diff.added).toContain("requestId");
  });

  it("detects removed fields", () => {
    const diff = diffEntries(entryA, entryB);
    expect(diff.removed).toContain("service");
  });

  it("detects changed fields", () => {
    const diff = diffEntries(entryA, entryB);
    const levelDiff = diff.changed.find((c) => c.field === "level");
    expect(levelDiff).toBeDefined();
    expect(levelDiff?.before).toBe("info");
    expect(levelDiff?.after).toBe("warn");
  });

  it("returns empty diff for identical entries", () => {
    const diff = diffEntries(entryA, entryA);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
  });
});

describe("diffLog", () => {
  it("returns empty array for fewer than 2 entries", () => {
    expect(diffLog([])).toEqual([]);
    expect(diffLog([entryA])).toEqual([]);
  });

  it("returns diffs between consecutive entries", () => {
    const diffs = diffLog([entryA, entryB]);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].index).toBe(1);
  });

  it("skips identical consecutive entries", () => {
    const diffs = diffLog([entryA, entryA, entryB]);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].index).toBe(2);
  });
});

describe("formatDiff", () => {
  it("formats a diff with all change types", () => {
    const diff = diffEntries(entryA, entryB);
    diff.index = 1;
    const output = formatDiff(diff);
    expect(output).toContain("Entry #1");
    expect(output).toContain("+ requestId");
    expect(output).toContain("- service");
    expect(output).toContain("~ level");
  });
});

describe("formatDiffs", () => {
  it("returns message when no diffs", () => {
    expect(formatDiffs([])).toBe("No differences found.");
  });

  it("formats multiple diffs separated by blank lines", () => {
    const diffs = diffLog([entryA, entryB, entryA]);
    const output = formatDiffs(diffs);
    expect(output).toContain("Entry #");
  });
});
