import { flattenObject, flattenEntry, flattenEntries, parseFlattenOption } from "./flatten";
import { LogEntry } from "./types";

const makeEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  timestamp: "2024-01-01T00:00:00.000Z",
  level: "info",
  message: "test",
  ...overrides,
});

describe("flattenObject", () => {
  it("returns flat object unchanged", () => {
    expect(flattenObject({ a: 1, b: "x" })).toEqual({ a: 1, b: "x" });
  });

  it("flattens one level of nesting", () => {
    expect(flattenObject({ a: { b: 1 } })).toEqual({ "a.b": 1 });
  });

  it("flattens multiple levels", () => {
    expect(flattenObject({ a: { b: { c: 42 } } })).toEqual({ "a.b.c": 42 });
  });

  it("respects maxDepth", () => {
    const deep = { a: { b: { c: 1 } } };
    const result = flattenObject(deep, "", 1);
    expect(result["a.b"]).toEqual({ c: 1 });
  });

  it("preserves arrays as-is", () => {
    expect(flattenObject({ tags: ["a", "b"] })).toEqual({ tags: ["a", "b"] });
  });

  it("handles null values", () => {
    expect(flattenObject({ a: null })).toEqual({ a: null });
  });
});

describe("flattenEntry", () => {
  it("flattens nested fields in an entry", () => {
    const entry = makeEntry({ context: { user: { id: 99 } } } as any);
    const result = flattenEntry(entry);
    expect((result as any)["context.user.id"]).toBe(99);
    expect((result as any)["context"]).toBeUndefined();
  });

  it("preserves top-level timestamp, level, message", () => {
    const entry = makeEntry({ meta: { region: "us-east" } } as any);
    const result = flattenEntry(entry);
    expect(result.timestamp).toBe(entry.timestamp);
    expect(result.level).toBe("info");
    expect(result.message).toBe("test");
  });
});

describe("flattenEntries", () => {
  it("flattens all entries in an array", () => {
    const entries = [
      makeEntry({ a: { b: 1 } } as any),
      makeEntry({ c: { d: 2 } } as any),
    ];
    const results = flattenEntries(entries);
    expect((results[0] as any)["a.b"]).toBe(1);
    expect((results[1] as any)["c.d"]).toBe(2);
  });
});

describe("parseFlattenOption", () => {
  it('parses "flat" as depth 5', () => {
    expect(parseFlattenOption("flat")).toBe(5);
  });

  it('parses "depth:3" as 3', () => {
    expect(parseFlattenOption("depth:3")).toBe(3);
  });

  it('parses bare number "2" as 2', () => {
    expect(parseFlattenOption("2")).toBe(2);
  });

  it("throws on invalid option", () => {
    expect(() => parseFlattenOption("bad")).toThrow(/Invalid flatten option/);
  });
});
