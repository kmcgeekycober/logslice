import { validateEntry, validateEntries, parseValidationRules } from "./validate";
import { LogEntry } from "./types";

const validEntry: LogEntry = {
  timestamp: "2024-01-01T00:00:00.000Z",
  level: "info",
  message: "Server started",
};

describe("validateEntry", () => {
  it("returns valid for a well-formed entry", () => {
    const result = validateEntry(validEntry);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for missing required field", () => {
    const entry = { level: "info", message: "test" } as unknown as LogEntry;
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: "timestamp"');
  });

  it("returns error for invalid level value", () => {
    const entry = { ...validEntry, level: "verbose" };
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/level/);
  });

  it("returns error for wrong field type", () => {
    const entry = { ...validEntry, message: 42 } as unknown as LogEntry;
    const result = validateEntry(entry);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/message/);
  });

  it("supports custom rules", () => {
    const entry = { ...validEntry, requestId: 123 } as unknown as LogEntry;
    const rules = [{ field: "requestId", required: true, type: "string" as const }];
    const result = validateEntry(entry, rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/requestId/);
  });
});

describe("validateEntries", () => {
  it("returns only invalid entries", () => {
    const entries: LogEntry[] = [
      validEntry,
      { level: "info", message: "no timestamp" } as unknown as LogEntry,
    ];
    const invalid = validateEntries(entries);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].result.errors).toContain('Missing required field: "timestamp"');
  });

  it("returns empty array when all entries are valid", () => {
    const invalid = validateEntries([validEntry]);
    expect(invalid).toHaveLength(0);
  });
});

describe("parseValidationRules", () => {
  it("parses field:type pairs into rules", () => {
    const rules = parseValidationRules(["userId:string", "count:number"]);
    expect(rules).toHaveLength(2);
    expect(rules[0]).toMatchObject({ field: "userId", type: "string", required: true });
    expect(rules[1]).toMatchObject({ field: "count", type: "number", required: true });
  });

  it("defaults to string type when type is omitted", () => {
    const rules = parseValidationRules(["sessionId"]);
    expect(rules[0].type).toBe("string");
  });
});
