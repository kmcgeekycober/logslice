import { tailLogs, parseTailOption, formatTailSummary } from "./tail";
import { LogEntry } from "./types";

function makeEntry(i: number): LogEntry {
  return {
    timestamp: `2024-01-01T00:00:0${i}Z`,
    level: "info",
    message: `message ${i}`,
  };
}

const entries: LogEntry[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(makeEntry);

describe("tailLogs", () => {
  it("returns last N entries", () => {
    const result = tailLogs(entries, 3);
    expect(result).toHaveLength(3);
    expect(result[0].message).toBe("message 7");
    expect(result[2].message).toBe("message 9");
  });

  it("returns all entries when count >= length", () => {
    expect(tailLogs(entries, 100)).toHaveLength(10);
  });

  it("returns empty array for count 0", () => {
    expect(tailLogs(entries, 0)).toHaveLength(0);
  });

  it("returns a copy, not the original", () => {
    const result = tailLogs(entries, 10);
    result.pop();
    expect(entries).toHaveLength(10);
  });
});

describe("parseTailOption", () => {
  it("parses --tail value", () => {
    expect(parseTailOption({ tail: "20" })).toEqual({ lines: 20, follow: false });
  });

  it("parses -n value", () => {
    expect(parseTailOption({ n: "5" })).toEqual({ lines: 5, follow: false });
  });

  it("defaults to 10 when flag present without value", () => {
    expect(parseTailOption({ tail: true })).toEqual({ lines: 10, follow: false });
  });

  it("parses --follow flag", () => {
    expect(parseTailOption({ tail: "5", follow: true })).toEqual({ lines: 5, follow: true });
  });

  it("throws on invalid value", () => {
    expect(() => parseTailOption({ tail: "abc" })).toThrow("Invalid tail value");
  });

  it("throws on negative value", () => {
    expect(() => parseTailOption({ tail: "-3" })).toThrow("Invalid tail value");
  });
});

describe("formatTailSummary", () => {
  it("shows all when shown >= total", () => {
    expect(formatTailSummary(5, 5)).toBe("Showing all 5 entries.");
    expect(formatTailSummary(1, 1)).toBe("Showing all 1 entry.");
  });

  it("shows partial count", () => {
    expect(formatTailSummary(100, 20)).toBe("Showing last 20 of 100 entries.");
  });
});
