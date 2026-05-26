import { mergeSorted, mergeDedup, mergeLogs, parseMergeOptions } from "./merge";
import { LogEntry } from "./types";

function makeEntry(timestamp: string, message: string, extra?: Partial<LogEntry>): LogEntry {
  return { timestamp, level: "info", message, ...extra };
}

const sourceA: LogEntry[] = [
  makeEntry("2024-01-01T00:00:01Z", "alpha"),
  makeEntry("2024-01-01T00:00:03Z", "gamma"),
];

const sourceB: LogEntry[] = [
  makeEntry("2024-01-01T00:00:02Z", "beta"),
  makeEntry("2024-01-01T00:00:04Z", "delta"),
];

describe("mergeSorted", () => {
  it("merges two sorted sources in order", () => {
    const result = mergeSorted([sourceA, sourceB]);
    expect(result.map((e) => e.message)).toEqual(["alpha", "beta", "gamma", "delta"]);
  });

  it("handles empty sources", () => {
    expect(mergeSorted([[], sourceB])).toEqual(sourceB);
    expect(mergeSorted([sourceA, []])).toEqual(sourceA);
    expect(mergeSorted([[], []])).toEqual([]);
  });

  it("merges a single source unchanged", () => {
    expect(mergeSorted([sourceA])).toEqual(sourceA);
  });

  it("merges three sources correctly", () => {
    const sourceC: LogEntry[] = [makeEntry("2024-01-01T00:00:00Z", "zero")];
    const result = mergeSorted([sourceA, sourceB, sourceC]);
    expect(result[0].message).toBe("zero");
    expect(result).toHaveLength(5);
  });
});

describe("mergeDedup", () => {
  it("removes duplicate entries", () => {
    const dup = [...sourceA, ...sourceA];
    const result = mergeDedup(dup, "timestamp");
    expect(result).toHaveLength(sourceA.length);
  });

  it("keeps unique entries intact", () => {
    const result = mergeDedup([...sourceA, ...sourceB], "timestamp");
    expect(result).toHaveLength(4);
  });
});

describe("mergeLogs", () => {
  it("returns correct totalInput and sourceCount", () => {
    const result = mergeLogs({ sources: [sourceA, sourceB] });
    expect(result.totalInput).toBe(4);
    expect(result.sourceCount).toBe(2);
    expect(result.duplicatesRemoved).toBe(0);
  });

  it("removes duplicates when deduplicate is true", () => {
    const result = mergeLogs({ sources: [sourceA, sourceA], deduplicate: true });
    expect(result.duplicatesRemoved).toBe(sourceA.length);
    expect(result.entries).toHaveLength(sourceA.length);
  });

  it("produces sorted output", () => {
    const result = mergeLogs({ sources: [sourceB, sourceA] });
    const timestamps = result.entries.map((e) => e.timestamp);
    expect(timestamps).toEqual([...timestamps].sort());
  });
});

describe("parseMergeOptions", () => {
  it("parses sort-field and dedup flags", () => {
    const opts = parseMergeOptions({ "sort-field": "level", dedup: true });
    expect(opts.sortField).toBe("level");
    expect(opts.deduplicate).toBe(true);
  });

  it("defaults to timestamp when sort-field not provided", () => {
    const opts = parseMergeOptions({});
    expect(opts.sortField).toBe("timestamp");
    expect(opts.deduplicate).toBe(false);
  });
});
