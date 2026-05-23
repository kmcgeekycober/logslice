/**
 * Parses raw log lines into structured JSON log entries.
 * Each line is expected to be a valid JSON object.
 */

export interface LogEntry {
  timestamp: string;
  level?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ParseResult {
  entries: LogEntry[];
  errors: Array<{ line: number; raw: string; reason: string }>;
}

/**
 * Parse a multiline string of JSON log entries.
 * Lines that are empty or whitespace-only are skipped.
 * Invalid JSON lines are collected in the errors array.
 */
export function parseLogLines(input: string): ParseResult {
  const lines = input.split("\n");
  const entries: LogEntry[] = [];
  const errors: ParseResult["errors"] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();

    if (raw.length === 0) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);

      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        errors.push({
          line: i + 1,
          raw,
          reason: "Parsed value is not a JSON object",
        });
        continue;
      }

      if (typeof parsed.timestamp !== "string" || parsed.timestamp.trim() === "") {
        errors.push({
          line: i + 1,
          raw,
          reason: 'Missing or invalid "timestamp" field (must be a non-empty string)',
        });
        continue;
      }

      entries.push(parsed as LogEntry);
    } catch {
      errors.push({
        line: i + 1,
        raw,
        reason: "Invalid JSON",
      });
    }
  }

  return { entries, errors };
}
