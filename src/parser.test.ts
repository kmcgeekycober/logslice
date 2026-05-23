import { parseLogLines } from "./parser";

const validLine = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({ timestamp: "2024-01-15T10:00:00Z", level: "info", message: "hello", ...overrides });

describe("parseLogLines", () => {
  it("parses a single valid log line", () => {
    const input = validLine();
    const { entries, errors } = parseLogLines(input);
    expect(errors).toHaveLength(0);
    expect(entries).toHaveLength(1);
    expect(entries[0].timestamp).toBe("2024-01-15T10:00:00Z");
    expect(entries[0].level).toBe("info");
  });

  it("parses multiple valid log lines", () => {
    const input = [validLine({ message: "first" }), validLine({ message: "second" })].join("\n");
    const { entries, errors } = parseLogLines(input);
    expect(errors).toHaveLength(0);
    expect(entries).toHaveLength(2);
  });

  it("skips blank lines", () => {
    const input = `\n${validLine()}\n\n`;
    const { entries, errors } = parseLogLines(input);
    expect(errors).toHaveLength(0);
    expect(entries).toHaveLength(1);
  });

  it("records an error for invalid JSON", () => {
    const { entries, errors } = parseLogLines("not json");
    expect(entries).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].reason).toBe("Invalid JSON");
    expect(errors[0].line).toBe(1);
  });

  it("records an error when timestamp is missing", () => {
    const input = JSON.stringify({ level: "warn", message: "no ts" });
    const { entries, errors } = parseLogLines(input);
    expect(entries).toHaveLength(0);
    expect(errors[0].reason).toMatch(/timestamp/);
  });

  it("records an error for non-object JSON values", () => {
    const { entries, errors } = parseLogLines("[1,2,3]");
    expect(entries).toHaveLength(0);
    expect(errors[0].reason).toMatch(/not a JSON object/);
  });

  it("preserves extra fields on log entries", () => {
    const input = validLine({ requestId: "abc-123", durationMs: 42 });
    const { entries } = parseLogLines(input);
    expect(entries[0].requestId).toBe("abc-123");
    expect(entries[0].durationMs).toBe(42);
  });
});
