import { LogEntry } from "./types";

export interface TailOptions {
  lines: number;
  follow?: boolean;
}

/**
 * Returns the last N entries from a log array.
 */
export function tailLogs(entries: LogEntry[], count: number): LogEntry[] {
  if (count <= 0) return [];
  if (count >= entries.length) return [...entries];
  return entries.slice(entries.length - count);
}

/**
 * Parse tail options from CLI-style args.
 * Supports: --tail 20, --tail=20, -n 20
 */
export function parseTailOption(
  args: Record<string, string | boolean | undefined>
): TailOptions {
  const raw = args["tail"] ?? args["n"];
  const lines = raw !== undefined && raw !== true ? parseInt(String(raw), 10) : 10;

  if (isNaN(lines) || lines < 0) {
    throw new Error(`Invalid tail value: ${raw}`);
  }

  return {
    lines,
    follow: args["follow"] === true || args["follow"] === "true",
  };
}

/**
 * Format a tail summary line.
 */
export function formatTailSummary(total: number, shown: number): string {
  if (shown >= total) {
    return `Showing all ${total} entr${total === 1 ? "y" : "ies"}.`;
  }
  return `Showing last ${shown} of ${total} entr${total === 1 ? "y" : "ies"}.`;
}
